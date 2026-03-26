package discord

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
)

// VoiceStateUpdate sends Opcode 4 to the Gateway to join/leave voice channels
func (c *Client) JoinVoiceChannel(guildID, channelID string) error {
	payload := map[string]interface{}{
		"op": 4,
		"d": map[string]interface{}{
			"guild_id":   guildID,
			"channel_id": channelID,
			"self_mute":  false,
			"self_deaf":  false,
		},
	}
	
	data, _ := json.Marshal(payload)
	return c.ws.WriteMessage(websocket.TextMessage, data)
}

func (c *Client) LeaveVoiceChannel(guildID string) error {
	payload := map[string]interface{}{
		"op": 4,
		"d": map[string]interface{}{
			"guild_id":   guildID,
			"channel_id": nil,
			"self_mute":  false,
			"self_deaf":  false,
		},
	}
	
	data, _ := json.Marshal(payload)
	return c.ws.WriteMessage(websocket.TextMessage, data)
}

// Simulated mock for the UDP Opus streaming system.
func (c *Client) PlayAudio(audioURL string) error {
	fmt.Printf("[Voice] Simulating streaming audio from %s over UDP...\n", audioURL)
	return nil
}
