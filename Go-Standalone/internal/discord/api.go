package discord

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)
func (c *Client) ReplyToInteraction(interactionID, token string, responseType int, content string, embeds []Embed, components []Component, stickerIDs []string) error {
	url := fmt.Sprintf("https://discord.com/api/v10/interactions/%s/%s/callback", interactionID, token)

	data := map[string]interface{}{}
	if content != "" {
		data["content"] = content
	}
	if len(embeds) > 0 {
		data["embeds"] = embeds
	}
	if len(components) > 0 {
		data["components"] = components
	}
	if len(stickerIDs) > 0 {
		data["sticker_ids"] = stickerIDs
	}

	payload := InteractionResponse{
		Type: responseType, // 4 = ChannelMessageWithSource
		Data: data,
	}

	return c.postJSON(url, payload)
}

func (c *Client) RegisterGlobalSlashCommand(appID string, cmd AppCommand) error {
	url := fmt.Sprintf("https://discord.com/api/v10/applications/%s/commands", appID)
	return c.postJSON(url, cmd)
}

func (c *Client) ShowModal(interactionID, token string, modal Component) error {
	url := fmt.Sprintf("https://discord.com/api/v10/interactions/%s/%s/callback", interactionID, token)
	payload := InteractionResponse{
		Type: 9, // Modal
		Data: map[string]interface{}{
			"title":      modal.Title,
			"custom_id":  modal.CustomID,
			"components": modal.Components,
		},
	}
	return c.postJSON(url, payload)
}

func (c *Client) DeferInteraction(interactionID, token string) error {
	url := fmt.Sprintf("https://discord.com/api/v10/interactions/%s/%s/callback", interactionID, token)
	payload := InteractionResponse{
		Type: 5,
	}
	return c.postJSON(url, payload)
}

func (c *Client) EditInteractionResponse(appID, token string, content string, embeds []Embed, components []Component) error {
	url := fmt.Sprintf("https://discord.com/api/v10/webhooks/%s/%s/messages/@original", appID, token)
	data := map[string]interface{}{}
	if content != "" {
		data["content"] = content
	}
	if len(embeds) > 0 {
		data["embeds"] = embeds
	}
	if len(components) > 0 {
		data["components"] = components
	}

	return c.patchJSON(url, data)
}

func (c *Client) DeleteMessage(channelID, messageID string) error {
	url := fmt.Sprintf("https://discord.com/api/v10/channels/%s/messages/%s", channelID, messageID)
	return c.deleteRequest(url, "")
}

func (c *Client) EditMessage(channelID, messageID, content string) error {
	url := fmt.Sprintf("https://discord.com/api/v10/channels/%s/messages/%s", channelID, messageID)
	data := map[string]interface{}{
		"content": content,
	}
	return c.patchJSON(url, data)
}

func (c *Client) CreateChannel(guildID, name string) error {
	url := fmt.Sprintf("https://discord.com/api/v10/guilds/%s/channels", guildID)
	data := map[string]interface{}{
		"name": name,
	}
	return c.postJSON(url, data)
}

func (c *Client) DeleteChannel(channelID string) error {
	url := fmt.Sprintf("https://discord.com/api/v10/channels/%s", channelID)
	return c.deleteRequest(url, "")
}

func (c *Client) CreateAutoModRule(guildID, name, keywordFilter string) error {
	url := fmt.Sprintf("https://discord.com/api/v10/guilds/%s/auto-moderation/rules", guildID)
	data := map[string]interface{}{
		"name":         name,
		"event_type":   1,
		"trigger_type": 1,
		"trigger_metadata": map[string]interface{}{
			"keyword_filter": []string{keywordFilter},
		},
		"actions": []map[string]interface{}{
			{
				"type": 1,
			},
		},
		"enabled": true,
	}
	return c.postJSON(url, data)
}

func (c *Client) ReplyWithFileToMessage(channelID, messageID, text, filename, filepathStr string) error {
	url := fmt.Sprintf("https://discord.com/api/v10/channels/%s/messages", channelID)

	payload := map[string]interface{}{
		"content": text,
		"message_reference": map[string]string{
			"message_id": messageID,
		},
	}

	return c.postMultipart(url, payload, filename, filepathStr)
}

func (c *Client) ReplyWithFileToInteraction(interactionID, token, text, filename, filepathStr string) error {
	url := fmt.Sprintf("https://discord.com/api/v10/interactions/%s/%s/callback", interactionID, token)

	payload := map[string]interface{}{
		"type": 4, // ChannelMessageWithSource
		"data": map[string]interface{}{
			"content": text,
		},
	}

	return c.postMultipart(url, payload, filename, filepathStr)
}

func (c *Client) SendPoll(channelID string, title string, options []string) error {
	url := fmt.Sprintf("https://discord.com/api/v10/channels/%s/messages", channelID)
	
	answers := []map[string]interface{}{}
	for _, opt := range options {
		answers = append(answers, map[string]interface{}{
			"poll_media": map[string]interface{}{
				"text": opt,
			},
		})
	}
	
	payload := map[string]interface{}{
		"poll": map[string]interface{}{
			"question": map[string]interface{}{
				"text": title,
			},
			"answers": answers,
			"duration": 24,
			"allow_multiselect": false,
			"layout_type": 1,
		},
	}
	
	return c.postJSON(url, payload)
}

func (c *Client) CreateScheduledEvent(guildID string, name string, startTime string) error {
	url := fmt.Sprintf("https://discord.com/api/v10/guilds/%s/scheduled-events", guildID)
	
	payload := map[string]interface{}{
		"name": name,
		"privacy_level": 2, // GUILD_ONLY
		"scheduled_start_time": startTime,
		"entity_type": 3, // EXTERNAL
		"entity_metadata": map[string]interface{}{
			"location": "Online",
		},
	}
	
	return c.postJSON(url, payload)
}

func (c *Client) CreateEmoji(guildID string, name string, path string) error {
	url := fmt.Sprintf("https://discord.com/api/v10/guilds/%s/emojis", guildID)

	imgData, err := os.ReadFile(path)
	if err != nil {
		return err
	}

	encoded := base64.StdEncoding.EncodeToString(imgData)
	dataURI := fmt.Sprintf("data:image/png;base64,%s", encoded)

	payload := map[string]interface{}{
		"name":  name,
		"image": dataURI,
	}

	return c.postJSON(url, payload)
}

func (c *Client) CreateWebhook(channelID, name string) error {
	url := fmt.Sprintf("https://discord.com/api/v10/channels/%s/webhooks", channelID)
	payload := map[string]interface{}{
		"name": name,
	}
	return c.postJSON(url, payload)
}

func (c *Client) SendWebhook(webhookID, token, content string) error {
	url := fmt.Sprintf("https://discord.com/api/v10/webhooks/%s/%s", webhookID, token)
	payload := map[string]interface{}{
		"content": content,
	}
	return c.postJSON(url, payload)
}

func (c *Client) GetApplicationInfo() (map[string]interface{}, error) {
	url := "https://discord.com/api/v10/applications/@me"
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

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	return result, nil
}
