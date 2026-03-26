package discord

import "sync"

type Cache struct {
	Users    sync.Map
	Guilds   sync.Map
	Channels sync.Map
	Messages sync.Map
	Roles    sync.Map
	Emojis   sync.Map
	Stickers sync.Map
	Presences sync.Map
	VoiceStates sync.Map
	StageInstances sync.Map
	ScheduledEvents sync.Map
}

func NewCache() *Cache {
	return &Cache{}
}

func (c *Cache) SetUser(u *User) {
	c.Users.Store(u.ID, u)
}

func (c *Cache) GetUser(id string) *User {
	if val, ok := c.Users.Load(id); ok {
		return val.(*User)
	}
	return nil
}

func (c *Cache) SetGuild(g *Guild) {
	c.Guilds.Store(g.ID, g)
}

func (c *Cache) GetGuild(id string) *Guild {
	if val, ok := c.Guilds.Load(id); ok {
		return val.(*Guild)
	}
	return nil
}

func (c *Client) initCache() {
	c.Cache = NewCache()

	// Hook cache updates into handlers
	c.Handlers.Ready = append(c.Handlers.Ready, func(d map[string]interface{}) {
		if guilds, ok := d["guilds"].([]interface{}); ok {
			for _, gData := range guilds {
				gMap := gData.(map[string]interface{})
				c.Cache.SetGuild(&Guild{ID: gMap["id"].(string)})
			}
		}
	})

	c.Handlers.MessageCreate = append(c.Handlers.MessageCreate, func(m *Message) {
		c.Cache.SetUser(&m.Author)
	})
}
