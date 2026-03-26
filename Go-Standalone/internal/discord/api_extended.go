package discord

import (
        "encoding/json"
        "fmt"
        "net/http"
        "net/url"
)

// Messages
func (c *Client) PinMessage(channelID, messageID string) error {
        return c.putJSON(fmt.Sprintf("https://discord.com/api/v10/channels/%s/pins/%s", channelID, messageID), nil, "")
}

func (c *Client) UnpinMessage(channelID, messageID string) error {
        return c.deleteRequest(fmt.Sprintf("https://discord.com/api/v10/channels/%s/pins/%s", channelID, messageID), "")
}

func (c *Client) AddReaction(channelID, messageID, emoji string) error {
        // emoji should be url encoded
        encoded := url.PathEscape(emoji)
        return c.putJSON(fmt.Sprintf("https://discord.com/api/v10/channels/%s/messages/%s/reactions/%s/@me", channelID, messageID, encoded), nil, "")
}

// Invites
func (c *Client) CreateInvite(channelID string, maxAge, maxUses int) error {
        payload := map[string]interface{}{
                "max_age":  maxAge,
                "max_uses": maxUses,
        }
        return c.postJSON(fmt.Sprintf("https://discord.com/api/v10/channels/%s/invites", channelID), payload)
}

// Guilds
func (c *Client) LeaveGuild(guildID string) error {
        return c.deleteRequest(fmt.Sprintf("https://discord.com/api/v10/users/@me/guilds/%s", guildID), "")
}

func (c *Client) GetAuditLogs(guildID string) (*AuditLog, error) {
        req, _ := http.NewRequest("GET", fmt.Sprintf("https://discord.com/api/v10/guilds/%s/audit-logs", guildID), nil)
        req.Header.Set("Authorization", "Bot "+c.Token)

        client := &http.Client{}
        resp, err := client.Do(req)
        if err != nil {
                return nil, err
        }
        defer resp.Body.Close()

        var logs AuditLog
        json.NewDecoder(resp.Body).Decode(&logs)
        return &logs, nil
}

// Stage Instances
func (c *Client) CreateStageInstance(channelID, topic string) error {
        payload := map[string]interface{}{
                "channel_id": channelID,
                "topic":      topic,
        }
        return c.postJSON("https://discord.com/api/v10/stage-instances", payload)
}

func (c *Client) UpdateStageInstance(channelID, topic string) error {
        payload := map[string]interface{}{
                "topic": topic,
        }
        return c.patchJSON(fmt.Sprintf("https://discord.com/api/v10/stage-instances/%s", channelID), payload)
}

func (c *Client) DeleteStageInstance(channelID string) error {
        return c.deleteRequest(fmt.Sprintf("https://discord.com/api/v10/stage-instances/%s", channelID), "")
}

// Guild Templates
func (c *Client) CreateGuildTemplate(guildID, name, description string) error {
        payload := map[string]interface{}{
                "name":        name,
                "description": description,
        }
        return c.postJSON(fmt.Sprintf("https://discord.com/api/v10/guilds/%s/templates", guildID), payload)
}

func (c *Client) SyncGuildTemplate(guildID, code string) error {
        return c.putJSON(fmt.Sprintf("https://discord.com/api/v10/guilds/%s/templates/%s", guildID, code), nil, "")
}

// Entitlements & SKUs (Monetization)
func (c *Client) GetSKUs(appID string) ([]interface{}, error) {
        req, _ := http.NewRequest("GET", fmt.Sprintf("https://discord.com/api/v10/applications/%s/skus", appID), nil)
        req.Header.Set("Authorization", "Bot "+c.Token)

        client := &http.Client{}
        resp, err := client.Do(req)
        if err != nil {
                return nil, err
        }
        defer resp.Body.Close()

        var skus []interface{}
        err = json.NewDecoder(resp.Body).Decode(&skus)
        return skus, err
}

func (c *Client) GetEntitlements(appID string) ([]interface{}, error) {
        req, _ := http.NewRequest("GET", fmt.Sprintf("https://discord.com/api/v10/applications/%s/entitlements", appID), nil)
        req.Header.Set("Authorization", "Bot "+c.Token)

        client := &http.Client{}
        resp, err := client.Do(req)
        if err != nil {
                return nil, err
        }
        defer resp.Body.Close()

        var entitlements []interface{}
        err = json.NewDecoder(resp.Body).Decode(&entitlements)
        return entitlements, err
}

// Auto-Moderation Extensions
func (c *Client) DeleteAutoModRule(guildID, ruleID string) error {
        return c.deleteRequest(fmt.Sprintf("https://discord.com/api/v10/guilds/%s/auto-moderation/rules/%s", guildID, ruleID), "")
}

// Thread Management
func (c *Client) AddThreadMember(threadID, userID string) error {
	return c.putJSON(fmt.Sprintf("https://discord.com/api/v10/channels/%s/thread-members/%s", threadID, userID), nil, "")
}

func (c *Client) RemoveThreadMember(threadID, userID string) error {
	return c.deleteRequest(fmt.Sprintf("https://discord.com/api/v10/channels/%s/thread-members/%s", threadID, userID), "")
}

func (c *Client) GetThreadMember(threadID, userID string) (map[string]interface{}, error) {
	req, _ := http.NewRequest("GET", fmt.Sprintf("https://discord.com/api/v10/channels/%s/thread-members/%s", threadID, userID), nil)
	req.Header.Set("Authorization", "Bot "+c.Token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var member map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&member)
	return member, err
}

// Channel Overrides
func (c *Client) EditChannelPermissions(channelID, overwriteID, allow, deny string, typeInt int) error {
	payload := map[string]interface{}{
		"allow": allow,
		"deny":  deny,
		"type":  typeInt,
	}
	return c.putJSON(fmt.Sprintf("https://discord.com/api/v10/channels/%s/permissions/%s", channelID, overwriteID), payload, "")
}

func (c *Client) DeleteChannelPermission(channelID, overwriteID string) error {
	return c.deleteRequest(fmt.Sprintf("https://discord.com/api/v10/channels/%s/permissions/%s", channelID, overwriteID), "")
}

// Application Commands Extensions
func (c *Client) DeleteGlobalSlashCommand(appID, commandID string) error {
	return c.deleteRequest(fmt.Sprintf("https://discord.com/api/v10/applications/%s/commands/%s", appID, commandID), "")
}

func (c *Client) GetGlobalSlashCommands(appID string) ([]interface{}, error) {
	req, _ := http.NewRequest("GET", fmt.Sprintf("https://discord.com/api/v10/applications/%s/commands", appID), nil)
	req.Header.Set("Authorization", "Bot "+c.Token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var commands []interface{}
	err = json.NewDecoder(resp.Body).Decode(&commands)
	return commands, err
}
