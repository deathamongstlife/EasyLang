package discord

import "encoding/json"

type Handlers struct {
	MessageCreate        []func(*Message)
	MessageUpdate        []func(*Message)
	MessageDelete        []func(map[string]interface{})
	MessageReactionAdd   []func(*ReactionEvent)
	MessageReactionRemove []func(*ReactionEvent)

	InteractionCreate    []func(*Interaction)

	GuildMemberAdd       []func(map[string]interface{})
	GuildMemberRemove    []func(map[string]interface{})
	GuildMemberUpdate    []func(map[string]interface{})
	GuildCreate          []func(*Guild)
	GuildUpdate          []func(*Guild)
	GuildDelete          []func(*Guild)
	GuildRoleCreate      []func(map[string]interface{})
	GuildRoleUpdate      []func(map[string]interface{})
	GuildRoleDelete      []func(map[string]interface{})

	ChannelCreate        []func(*Channel)
	ChannelUpdate        []func(*Channel)
	ChannelDelete        []func(*Channel)
	ChannelPinsUpdate    []func(map[string]interface{})

	ThreadCreate         []func(*Channel)
	ThreadUpdate         []func(*Channel)
	ThreadDelete         []func(map[string]interface{})

	VoiceStateUpdate     []func(map[string]interface{})
	VoiceServerUpdate    []func(map[string]interface{})

	Ready                []func(map[string]interface{})
	GenericEvent         []func(string, map[string]interface{})
}

func (c *Client) handleEvent(eventName string, data json.RawMessage) {
	var payload map[string]interface{}
	json.Unmarshal(data, &payload)
	
	for _, h := range c.Handlers.GenericEvent {
		h(eventName, payload)
	}

	switch eventName {
	case "MESSAGE_CREATE":
		var msg Message
		json.Unmarshal(data, &msg)
		for _, h := range c.Handlers.MessageCreate {
			h(&msg)
		}
	case "MESSAGE_UPDATE":
		var msg Message
		json.Unmarshal(data, &msg)
		for _, h := range c.Handlers.MessageUpdate {
			h(&msg)
		}
	case "MESSAGE_DELETE":
		var d map[string]interface{}
		json.Unmarshal(data, &d)
		for _, h := range c.Handlers.MessageDelete {
			h(d)
		}
	case "MESSAGE_REACTION_ADD":
		var evt ReactionEvent
		json.Unmarshal(data, &evt)
		for _, h := range c.Handlers.MessageReactionAdd {
			h(&evt)
		}
	case "MESSAGE_REACTION_REMOVE":
		var evt ReactionEvent
		json.Unmarshal(data, &evt)
		for _, h := range c.Handlers.MessageReactionRemove {
			h(&evt)
		}
	case "INTERACTION_CREATE":
		var interaction Interaction
		json.Unmarshal(data, &interaction)
		for _, h := range c.Handlers.InteractionCreate {
			h(&interaction)
		}
	case "GUILD_MEMBER_ADD":
		var d map[string]interface{}
		json.Unmarshal(data, &d)
		for _, h := range c.Handlers.GuildMemberAdd {
			h(d)
		}
	case "GUILD_MEMBER_REMOVE":
		var d map[string]interface{}
		json.Unmarshal(data, &d)
		for _, h := range c.Handlers.GuildMemberRemove {
			h(d)
		}
	case "GUILD_MEMBER_UPDATE":
		var d map[string]interface{}
		json.Unmarshal(data, &d)
		for _, h := range c.Handlers.GuildMemberUpdate {
			h(d)
		}
	case "GUILD_CREATE":
		var g Guild
		json.Unmarshal(data, &g)
		for _, h := range c.Handlers.GuildCreate {
			h(&g)
		}
	case "GUILD_UPDATE":
		var g Guild
		json.Unmarshal(data, &g)
		for _, h := range c.Handlers.GuildUpdate {
			h(&g)
		}
	case "GUILD_DELETE":
		var g Guild
		json.Unmarshal(data, &g)
		for _, h := range c.Handlers.GuildDelete {
			h(&g)
		}
	case "GUILD_ROLE_CREATE":
		var d map[string]interface{}
		json.Unmarshal(data, &d)
		for _, h := range c.Handlers.GuildRoleCreate {
			h(d)
		}
	case "GUILD_ROLE_UPDATE":
		var d map[string]interface{}
		json.Unmarshal(data, &d)
		for _, h := range c.Handlers.GuildRoleUpdate {
			h(d)
		}
	case "GUILD_ROLE_DELETE":
		var d map[string]interface{}
		json.Unmarshal(data, &d)
		for _, h := range c.Handlers.GuildRoleDelete {
			h(d)
		}
	case "CHANNEL_CREATE":
		var ch Channel
		json.Unmarshal(data, &ch)
		for _, h := range c.Handlers.ChannelCreate {
			h(&ch)
		}
	case "CHANNEL_UPDATE":
		var ch Channel
		json.Unmarshal(data, &ch)
		for _, h := range c.Handlers.ChannelUpdate {
			h(&ch)
		}
	case "CHANNEL_DELETE":
		var ch Channel
		json.Unmarshal(data, &ch)
		for _, h := range c.Handlers.ChannelDelete {
			h(&ch)
		}
	case "CHANNEL_PINS_UPDATE":
		var d map[string]interface{}
		json.Unmarshal(data, &d)
		for _, h := range c.Handlers.ChannelPinsUpdate {
			h(d)
		}
	case "THREAD_CREATE":
		var ch Channel
		json.Unmarshal(data, &ch)
		for _, h := range c.Handlers.ThreadCreate {
			h(&ch)
		}
	case "THREAD_UPDATE":
		var ch Channel
		json.Unmarshal(data, &ch)
		for _, h := range c.Handlers.ThreadUpdate {
			h(&ch)
		}
	case "THREAD_DELETE":
		var d map[string]interface{}
		json.Unmarshal(data, &d)
		for _, h := range c.Handlers.ThreadDelete {
			h(d)
		}
	case "VOICE_STATE_UPDATE":
		var d map[string]interface{}
		json.Unmarshal(data, &d)
		for _, h := range c.Handlers.VoiceStateUpdate {
			h(d)
		}
	case "VOICE_SERVER_UPDATE":
		var d map[string]interface{}
		json.Unmarshal(data, &d)
		for _, h := range c.Handlers.VoiceServerUpdate {
			h(d)
		}
	case "READY":
		var d map[string]interface{}
		json.Unmarshal(data, &d)
		if user, ok := d["user"].(map[string]interface{}); ok {
			c.BotID = user["id"].(string)
		}
		if app, ok := d["application"].(map[string]interface{}); ok {
			c.AppID = app["id"].(string)
		}
		for _, h := range c.Handlers.Ready {
			h(d)
		}
	}
}
