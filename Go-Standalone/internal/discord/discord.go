package discord

import (
        "bytes"
        "encoding/json"
        "fmt"
	"github.com/ezlang/ezbot/internal/logger"
        "io"
        "mime/multipart"
        "net/http"
        "os"
        "time"

        "github.com/gorilla/websocket"
)
const (
	GatewayURL = "wss://gateway.discord.gg/?v=10&encoding=json"
)

type Client struct {
	Token         string
	ws            *websocket.Conn
	Handlers      Handlers
	Cache         *Cache
	isRunning     bool
	heartbeatInt  time.Duration
	lastSeq       interface{}
	lastAck       time.Time
	SessionID     string
	stopHeartbeat chan bool
	BotID         string
	AppID         string
}

type GatewayPayload struct {
	Op int             `json:"op"`
	D  json.RawMessage `json:"d"`
	S  *int            `json:"s"`
	T  string          `json:"t"`
}

func NewClient(token string) *Client {
	c := &Client{
		Token:         token,
		stopHeartbeat: make(chan bool),
	}
	c.initCache()
	c.debugHandlers()
	return c
}

func (c *Client) Start() error {
	var err error
	c.ws, _, err = websocket.DefaultDialer.Dial(GatewayURL, nil)
	if err != nil {
		return err
	}

	c.isRunning = true

	// Handle initial Hello and start heartbeating
	go c.listen()

	return nil
}

func (c *Client) listen() {
	defer c.Stop()

	for {
		if !c.isRunning {
			return
		}

		_, message, err := c.ws.ReadMessage()
		if err != nil {
			if c.isRunning {
				logger.Error("WebSocket Read Error: %v. Attempting to reconnect...", err)
				c.reconnect()
			}
			return
		}

		var payload GatewayPayload
		json.Unmarshal(message, &payload)

		if payload.S != nil {
			c.lastSeq = *payload.S
		}

		switch payload.Op {
		case 10: // Hello
			var data map[string]interface{}
			json.Unmarshal(payload.D, &data)
			interval := data["heartbeat_interval"].(float64)
			c.heartbeatInt = time.Duration(interval) * time.Millisecond
			
			// Stop previous heartbeat if exists
			select {
			case c.stopHeartbeat <- true:
			default:
			}
			
			go c.heartbeat()
			
			if c.SessionID != "" {
				c.resume()
			} else {
				c.identify()
			}

		case 11: // Heartbeat ACK
			c.lastAck = time.Now()

		case 7: // Reconnect
			logger.Warn("Discord requested Reconnect (Opcode 7).")
			c.reconnect()
			return

		case 9: // Invalid Session
			var resumable bool
			json.Unmarshal(payload.D, &resumable)
			logger.Error("Received Invalid Session from Discord. Resumable: %v", resumable)
			if !resumable {
				c.SessionID = ""
				c.lastSeq = nil
			}
			time.Sleep(2 * time.Second)
			c.reconnect()
			return

		case 0: // Event
			if payload.T == "READY" {
				var data map[string]interface{}
				json.Unmarshal(payload.D, &data)
				c.SessionID = data["session_id"].(string)
				logger.Info("Bot session started: %s", c.SessionID)
			}
			c.handleEvent(payload.T, payload.D)
		}
	}
}

func (c *Client) heartbeat() {
	ticker := time.NewTicker(c.heartbeatInt)
	c.lastAck = time.Now()
	
	for {
		select {
		case <-ticker.C:
			if !c.isRunning {
				return
			}
			
			// If we haven't received an ACK since the last heartbeat, something is wrong
			if time.Since(c.lastAck) > c.heartbeatInt * 2 {
				logger.Error("Heartbeat not acknowledged by Discord. Reconnecting...")
				c.reconnect()
				return
			}

			payload := map[string]interface{}{
				"op": 1,
				"d":  c.lastSeq,
			}
			c.sendJSON(payload)
		case <-c.stopHeartbeat:
			ticker.Stop()
			return
		}
	}
}

func (c *Client) identify() {
	logger.Info("Identifying with Discord Gateway...")
	payload := map[string]interface{}{
		"op": 2,
		"d": map[string]interface{}{
			"token": c.Token,
			"intents": 3276799, // ALL INTENTS
			"properties": map[string]string{
				"$os":      "linux",
				"$browser": "ezbot",
				"$device":  "ezbot",
			},
		},
	}
	c.sendJSON(payload)
}

func (c *Client) resume() {
	logger.Info("Attempting to resume session: %s", c.SessionID)
	payload := map[string]interface{}{
		"op": 6,
		"d": map[string]interface{}{
			"token":      c.Token,
			"session_id": c.SessionID,
			"seq":        c.lastSeq,
		},
	}
	c.sendJSON(payload)
}

func (c *Client) reconnect() {
	if c.ws != nil {
		c.ws.Close()
	}
	time.Sleep(1 * time.Second)
	err := c.Start()
	if err != nil {
		logger.Error("Failed to reconnect: %v", err)
		// Exponential backoff could be added here
	}
}

func (c *Client) sendJSON(v interface{}) error {
	data, _ := json.Marshal(v)
	return c.ws.WriteMessage(websocket.TextMessage, data)
}

func (c *Client) IsRunning() bool {
	return c.isRunning
}

func (c *Client) Stop() {
	c.isRunning = false
	if c.ws != nil {
		c.ws.Close()
	}
	logger.Warn("Bot disconnected.")
}

func (c *Client) GetGuild(guildID string) (*Guild, error) {
	url := fmt.Sprintf("https://discord.com/api/v10/guilds/%s", guildID)
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("Authorization", "Bot "+c.Token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("discord API error: %d - %s", resp.StatusCode, string(bodyBytes))
	}

	var guild Guild
	err = json.NewDecoder(resp.Body).Decode(&guild)
	return &guild, err
}


func (c *Client) ReplyToMessage(channelID, messageID, text string, embeds []Embed, components []Component, stickerIDs []string) error {
	url := fmt.Sprintf("https://discord.com/api/v10/channels/%s/messages", channelID)

	payload := map[string]interface{}{
		"content": text,
		"message_reference": map[string]string{
			"message_id": messageID,
		},
	}

	if len(embeds) > 0 {
		payload["embeds"] = embeds
	}
	if len(components) > 0 {
		payload["components"] = components
	}
	if len(stickerIDs) > 0 {
		payload["sticker_ids"] = stickerIDs
	}

	return c.postJSON(url, payload)
}

func (c *Client) UnbanUser(guildID, userID string) error {
	url := fmt.Sprintf("https://discord.com/api/v10/guilds/%s/bans/%s", guildID, userID)
	return c.deleteRequest(url, "")
}

func (c *Client) PurgeMessages(channelID string, amount int) error {
	// Simple bulk delete (last N messages)
	// First get the messages
	url := fmt.Sprintf("https://discord.com/api/v10/channels/%s/messages?limit=%d", channelID, amount)
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("Authorization", "Bot "+c.Token)
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil { return err }
	defer resp.Body.Close()
	
	var messages []map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&messages)
	
	if len(messages) == 0 { return nil }
	
	var ids []string
	for _, m := range messages {
		ids = append(ids, m["id"].(string))
	}
	
	bulkUrl := fmt.Sprintf("https://discord.com/api/v10/channels/%s/messages/bulk-delete", channelID)
	payload := map[string]interface{}{
		"messages": ids,
	}
	return c.postJSON(bulkUrl, payload)
}

func (c *Client) SetNickname(guildID, userID, nickname string) error {
	url := fmt.Sprintf("https://discord.com/api/v10/guilds/%s/members/%s", guildID, userID)
	payload := map[string]interface{}{
		"nick": nickname,
	}
	return c.patchJSON(url, payload)
}

func (c *Client) CreateRole(guildID, name string, color int) error {
	url := fmt.Sprintf("https://discord.com/api/v10/guilds/%s/roles", guildID)
	payload := map[string]interface{}{
		"name": name,
	}
	if color != 0 {
		payload["color"] = color
	}
	return c.postJSON(url, payload)
}

func (c *Client) DeleteRole(guildID, roleID string) error {
	url := fmt.Sprintf("https://discord.com/api/v10/guilds/%s/roles/%s", guildID, roleID)
	return c.deleteRequest(url, "")
}

func (c *Client) BanUser(guildID, userID, reason string) error {
	url := fmt.Sprintf("https://discord.com/api/v10/guilds/%s/bans/%s", guildID, userID)
	payload := map[string]interface{}{
		"delete_message_seconds": 0,
	}
	return c.putJSON(url, payload, reason) // Bans use PUT
}

func (c *Client) GetMember(guildID, userID string) (*Member, error) {
	url := fmt.Sprintf("https://discord.com/api/v10/guilds/%s/members/%s", guildID, userID)
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("Authorization", "Bot "+c.Token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("discord API error: %d - %s", resp.StatusCode, string(bodyBytes))
	}

	var member Member
	err = json.NewDecoder(resp.Body).Decode(&member)
	return &member, err
}

func (c *Client) KickUser(guildID, userID, reason string) error {
	url := fmt.Sprintf("https://discord.com/api/v10/guilds/%s/members/%s", guildID, userID)
	return c.deleteRequest(url, reason)
}

func (c *Client) TimeoutUser(guildID, userID, untilISO string) error {
	url := fmt.Sprintf("https://discord.com/api/v10/guilds/%s/members/%s", guildID, userID)
	payload := map[string]interface{}{
		"communication_disabled_until": untilISO,
	}
	return c.patchJSON(url, payload)
}

func (c *Client) AddRole(guildID, userID, roleID string) error {
	url := fmt.Sprintf("https://discord.com/api/v10/guilds/%s/members/%s/roles/%s", guildID, userID, roleID)
	return c.putJSON(url, nil, "")
}

func (c *Client) RemoveRole(guildID, userID, roleID string) error {
	url := fmt.Sprintf("https://discord.com/api/v10/guilds/%s/members/%s/roles/%s", guildID, userID, roleID)
	return c.deleteRequest(url, "")
}

func (c *Client) postJSON(url string, payload interface{}) error {
	body, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(body))
	return c.doRequest(req)
}

func (c *Client) putJSON(url string, payload interface{}, reason string) error {
	var body []byte
	if payload != nil {
		body, _ = json.Marshal(payload)
	}
	req, _ := http.NewRequest("PUT", url, bytes.NewBuffer(body))
	if reason != "" {
		req.Header.Set("X-Audit-Log-Reason", reason)
	}
	return c.doRequest(req)
}

func (c *Client) patchJSON(url string, payload interface{}) error {
	body, _ := json.Marshal(payload)
	req, _ := http.NewRequest("PATCH", url, bytes.NewBuffer(body))
	return c.doRequest(req)
}

func (c *Client) deleteRequest(url string, reason string) error {
	req, _ := http.NewRequest("DELETE", url, nil)
	if reason != "" {
		req.Header.Set("X-Audit-Log-Reason", reason)
	}
	return c.doRequest(req)
}

func (c *Client) doRequest(req *http.Request) error {
        req.Header.Set("Authorization", "Bot "+c.Token)
        if req.Method != "DELETE" && req.Header.Get("Content-Type") == "" {
                req.Header.Set("Content-Type", "application/json")
        }

        client := &http.Client{}
        resp, err := client.Do(req)
        if err != nil {
                return err
        }
        defer resp.Body.Close()

        if resp.StatusCode >= 400 {
                bodyBytes, _ := io.ReadAll(resp.Body)
                return fmt.Errorf("discord API error: %d - %s", resp.StatusCode, string(bodyBytes))
        }

        return nil
}

func (c *Client) postMultipart(url string, payload interface{}, filename, filepathStr string) error {
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	if payload != nil {
		payloadBytes, err := json.Marshal(payload)
		if err != nil {
			return err
		}
		err = writer.WriteField("payload_json", string(payloadBytes))
		if err != nil {
			return err
		}
	}

	if filepathStr != "" {
		file, err := os.Open(filepathStr)
		if err != nil {
			return err
		}
		defer file.Close()

		part, err := writer.CreateFormFile("files[0]", filename)
		if err != nil {
			return err
		}
		_, err = io.Copy(part, file)
		if err != nil {
			return err
		}
	}

	err := writer.Close()
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", url, &body)
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("Authorization", "Bot "+c.Token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("discord API error: %d - %s", resp.StatusCode, string(bodyBytes))
	}

	return nil
}
