package discord


type User struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Bot      bool   `json:"bot"`
}

type Member struct {
	User  User     `json:"user"`
	Roles []string `json:"roles"`
}

type Message struct {
	ID        string       `json:"id"`
	ChannelID string       `json:"channel_id"`
	GuildID   string       `json:"guild_id"`
	Content   string       `json:"content"`
	Author    User         `json:"author"`
	Member    Member       `json:"member"`
	Mentions  []User       `json:"mentions"`
	Attachments []Attachment `json:"attachments"`
}

type Attachment struct {
	ID       string `json:"id"`
	Filename string `json:"filename"`
	URL      string `json:"url"`
}

type Guild struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	OwnerID string `json:"owner_id"`
}

type Interaction struct {
	ID        string          `json:"id"`
	AppID     string          `json:"application_id"`
	Type      int             `json:"type"`
	Data      InteractionData `json:"data"`
	GuildID   string          `json:"guild_id"`
	ChannelID string          `json:"channel_id"`
	Member    Member          `json:"member"`
	User      User            `json:"user"`
	Token     string          `json:"token"`
	Message   *Message        `json:"message,omitempty"`
}

type InteractionData struct {
	ID            string                        `json:"id"`
	Name          string                        `json:"name"`
	Type          int                           `json:"type"`
	CustomID      string                        `json:"custom_id"`
	ComponentType int                           `json:"component_type"`
	Values        []string                      `json:"values"`
	Options       []InteractionDataOption       `json:"options"`
	Components    []ModalSubmitActionRow        `json:"components"`
}

type InteractionDataOption struct {
	Name    string                  `json:"name"`
	Type    int                     `json:"type"`
	Value   interface{}             `json:"value"`
	Options []InteractionDataOption `json:"options"`
}

type ModalSubmitActionRow struct {
	Type       int                  `json:"type"`
	Components []ModalSubmitTextInput `json:"components"`
}

type ModalSubmitTextInput struct {
	Type     int    `json:"type"`
	CustomID string `json:"custom_id"`
	Value    string `json:"value"`
}

type AppCommand struct {
	Name        string             `json:"name"`
	Description string             `json:"description"`
	Type        int                `json:"type"`
	Options     []AppCommandOption `json:"options"`
}

type AppCommandOption struct {
	Type        int                `json:"type"`
	Name        string             `json:"name"`
	Description string             `json:"description"`
	Required    bool               `json:"required"`
	Options     []AppCommandOption `json:"options,omitempty"`
}

type Embed struct {
	Title       string `json:"title,omitempty"`
	Description string `json:"description,omitempty"`
	Color       int    `json:"color,omitempty"`
}

type SelectOption struct {
	Label       string `json:"label"`
	Value       string `json:"value"`
	Description string `json:"description,omitempty"`
}

type Component struct {
	Type       int            `json:"type"`
	CustomID   string         `json:"custom_id,omitempty"`
	Style      int            `json:"style,omitempty"`
	Label      string         `json:"label,omitempty"`
	Title      string         `json:"title,omitempty"`
	Options    []SelectOption `json:"options,omitempty"`
	Components []Component    `json:"components,omitempty"`
}

type InteractionResponse struct {
	Type int                    `json:"type"`
	Data map[string]interface{} `json:"data,omitempty"`
}
