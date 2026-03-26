package discord

import (
	"github.com/ezlang/ezbot/internal/logger"
)

// Hook logging into interactions to see why they are failing
func (c *Client) debugHandlers() {
	c.Handlers.InteractionCreate = append(c.Handlers.InteractionCreate, func(i *Interaction) {
		logger.Debug("Received Interaction! Type: %d, CustomID/Name: %s/%s", i.Type, i.Data.CustomID, i.Data.Name)
	})

	c.Handlers.Ready = append(c.Handlers.Ready, func(d map[string]interface{}) {
		logger.Discord("Bot connected successfully to Gateway!")
	})

	c.Handlers.MessageCreate = append(c.Handlers.MessageCreate, func(m *Message) {
		if !m.Author.Bot {
			logger.Discord("Received Message: %s from %s", m.Content, m.Author.Username)
		}
	})
}

// Add a raw hook
func (c *Client) RawDebug(eventName string) {
    if eventName != "MESSAGE_CREATE" && eventName != "INTERACTION_CREATE" {
       // logger.Debug("RAW EVENT: %s", eventName)
    }
}
