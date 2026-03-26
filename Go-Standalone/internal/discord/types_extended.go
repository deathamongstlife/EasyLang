package discord

type Invite struct {
	Code      string `json:"code"`
	Guild     *Guild `json:"guild,omitempty"`
	Channel   *Channel `json:"channel"`
	Inviter   *User  `json:"inviter,omitempty"`
	Uses      int    `json:"uses,omitempty"`
	MaxUses   int    `json:"max_uses,omitempty"`
}

type Channel struct {
	ID   string `json:"id"`
	Type int    `json:"type"`
	Name string `json:"name,omitempty"`
}

type ReactionEvent struct {
	UserID    string `json:"user_id"`
	ChannelID string `json:"channel_id"`
	MessageID string `json:"message_id"`
	GuildID   string `json:"guild_id,omitempty"`
	Emoji     Emoji  `json:"emoji"`
}

type Emoji struct {
	ID   string `json:"id,omitempty"`
	Name string `json:"name"`
}

type AuditLog struct {
	Webhooks []interface{} `json:"webhooks"`
	Users    []User        `json:"users"`
	Entries  []AuditLogEntry `json:"audit_log_entries"`
}

type AuditLogEntry struct {
	TargetID   string `json:"target_id"`
	Changes    []interface{} `json:"changes,omitempty"`
	UserID     string `json:"user_id"`
	ID         string `json:"id"`
	ActionType int    `json:"action_type"`
	Reason     string `json:"reason,omitempty"`
}
