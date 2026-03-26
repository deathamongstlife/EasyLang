package main

import (
	"fmt"
	"github.com/ezlang/ezbot/internal/discord"
)

func main() {
	client := discord.NewClient("DISCORD_TOKEN_HERE")
	info, err := client.GetApplicationInfo()
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Println("App ID:", info["id"])
}
