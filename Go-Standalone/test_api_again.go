package main
import (
	"fmt"
	"github.com/ezlang/ezbot/internal/discord"
)
func main() {
	client := discord.NewClient("DISCORD_TOKEN_HERE")
	fmt.Println("Connecting...")
	err := client.Start()
	fmt.Println("Started:", err)
	info, err := client.GetApplicationInfo()
	fmt.Println("App Info:", info, err)
}
