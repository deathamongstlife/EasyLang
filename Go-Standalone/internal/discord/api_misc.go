package discord

import (
	"fmt"
	"encoding/json"
	"bytes"
	"net/http"
)

// Users
func (c *Client) SendDM(userID, text string) error {
	// 1. Open a DM channel
	url := "https://discord.com/api/v10/users/@me/channels"
	payload := map[string]interface{}{
		"recipient_id": userID,
	}
	
	body, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(body))
	req.Header.Set("Authorization", "Bot "+c.Token)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	var dmChannel Channel
	if err := json.NewDecoder(resp.Body).Decode(&dmChannel); err != nil {
		return err
	}

	// 2. Send message to the new channel ID
	return c.ReplyToMessage(dmChannel.ID, "", text, nil, nil, nil)
}

func (c *Client) FetchUser(userID string) (*User, error) {
	req, _ := http.NewRequest("GET", fmt.Sprintf("https://discord.com/api/v10/users/%s", userID), nil)
	req.Header.Set("Authorization", "Bot "+c.Token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var user User
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return nil, err
	}
	return &user, nil
}

