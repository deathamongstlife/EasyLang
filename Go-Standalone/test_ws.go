package main

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
)

func main() {
	uri := "wss://gateway.discord.gg/?v=10&encoding=json"
	ws, _, err := websocket.DefaultDialer.Dial(uri, nil)
	if err != nil {
		fmt.Println("Dial error:", err)
		return
	}
	defer ws.Close()

	_, msg, _ := ws.ReadMessage()
	fmt.Println("Hello:", string(msg))

	payload := map[string]interface{}{
		"op": 2,
		"d": map[string]interface{}{
			"token":   "DISCORD_TOKEN_HERE",
			"intents": 3276799,
			"properties": map[string]string{
				"os":      "linux",
				"browser": "ezbot",
				"device":  "ezbot",
			},
		},
	}
	data, _ := json.Marshal(payload)
	ws.WriteMessage(websocket.TextMessage, data)

	_, resp, err := ws.ReadMessage()
	fmt.Println("Identify response:", string(resp), err)
}
