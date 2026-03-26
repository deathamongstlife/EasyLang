package lexer

type TokenType string

const (
	TokenEOF     TokenType = "EOF"
	TokenIllegal TokenType = "ILLEGAL"
	TokenIdent   TokenType = "IDENTIFIER"
	TokenString  TokenType = "STRING"
	TokenNumber  TokenType = "NUMBER"

	// Symbols
	TokenAssign TokenType = "="
	TokenPlus   TokenType = "+"
	TokenMinus  TokenType = "-"
	TokenBang   TokenType = "!"
	TokenEq     TokenType = "=="
	TokenNotEq  TokenType = "!="
	TokenLT     TokenType = "<"
	TokenGT     TokenType = ">"
	TokenDot    TokenType = "."
	TokenSlash  TokenType = "/"
	TokenComma  TokenType = ","
	TokenColon  TokenType = ":"
	TokenLBrace TokenType = "{"
	TokenRBrace TokenType = "}"
	TokenLBracket TokenType = "["
	TokenRBracket TokenType = "]"

	// Natural Language Keywords
	TokenWhen    TokenType = "WHEN"
	TokenBot     TokenType = "BOT"
	TokenStarts  TokenType = "STARTS"
	TokenMessage TokenType = "MESSAGE"
	TokenSays    TokenType = "SAYS"
	TokenReply   TokenType = "REPLY"
	TokenWith    TokenType = "WITH"
	TokenEmbed   TokenType = "EMBED"
	TokenEnd     TokenType = "END"
	TokenStart   TokenType = "START"
	TokenToken   TokenType = "TOKEN"
	TokenSet     TokenType = "SET"
	TokenTo      TokenType = "TO"
	TokenUser    TokenType = "USER"
	TokenMember  TokenType = "MEMBER"
	TokenBan     TokenType = "BAN"
	TokenUnban   TokenType = "UNBAN"
	TokenKick    TokenType = "KICK"
	TokenFor     TokenType = "FOR"
	TokenTimeout TokenType = "TIMEOUT"
	TokenMinutes TokenType = "MINUTES"
	TokenAdd     TokenType = "ADD"
	TokenRemove  TokenType = "REMOVE"
	TokenRole    TokenType = "ROLE"
	TokenFrom    TokenType = "FROM"
	TokenSend    TokenType = "SEND"
	TokenChannel TokenType = "CHANNEL"
	TokenCreate  TokenType = "CREATE"
	TokenThread  TokenType = "THREAD"
	TokenDefer   TokenType = "DEFER"
	TokenEdit    TokenType = "EDIT"
	TokenDelete  TokenType = "DELETE"
	TokenPurge   TokenType = "PURGE"
	TokenDM      TokenType = "DM"
	TokenMessages TokenType = "MESSAGES"
	TokenNickname TokenType = "NICKNAME"
	TokenModal   TokenType = "MODAL"
	TokenTitled  TokenType = "TITLED"
	TokenSubmitted TokenType = "SUBMITTED"
	TokenMenu    TokenType = "MENU"
	TokenOptions TokenType = "OPTIONS"
	TokenIs      TokenType = "IS"
	TokenUsed    TokenType = "USED"
	TokenCreated TokenType = "CREATED"
	TokenJoins   TokenType = "JOINS"
	TokenLeaves  TokenType = "LEAVES"
	TokenJoin TokenType = "JOIN"
	TokenVoice TokenType = "VOICE"
	TokenPlay TokenType = "PLAY"
	TokenAudio TokenType = "AUDIO"
	TokenFile TokenType = "FILE"
	TokenAttachment TokenType = "ATTACHMENT"
        TokenIf TokenType = "IF"
        TokenHas TokenType = "HAS"
        TokenPermission TokenType = "PERMISSION"
        TokenAutomod TokenType = "AUTOMOD"
        TokenRule TokenType = "RULE"
        TokenBlocking TokenType = "BLOCKING"
        TokenPoll TokenType = "POLL"
        TokenScheduled TokenType = "SCHEDULED"
        TokenEvent TokenType = "EVENT"
        TokenEmoji TokenType = "EMOJI"
        TokenStarting TokenType = "STARTING"

        TokenWebhook TokenType = "WEBHOOK"
        TokenVia TokenType = "VIA"
        TokenSticker TokenType = "STICKER"
        TokenInfo      TokenType = "INFO"
        TokenGet       TokenType = "GET"

        // Module / File Loading
        TokenLoad    TokenType = "LOAD"
        TokenInclude TokenType = "INCLUDE"
        TokenPackage TokenType = "PACKAGE"
        TokenNpm     TokenType = "NPM"
        TokenPython  TokenType = "PYTHON"
        TokenAs      TokenType = "AS"
        // Missing Component v2 and Context Menus
        TokenMentionable TokenType = "MENTIONABLE"
        TokenContext     TokenType = "CONTEXT"
        TokenSubcommand  TokenType = "SUBCOMMAND"
        TokenGroup       TokenType = "GROUP"
        )
        type Token struct {
	Type    TokenType
	Literal string
	Line    int
	Column  int
	}

	var keywords = map[string]TokenType{
	"when":    TokenWhen,
	"bot":     TokenBot,
	"starts":  TokenStarts,
	"message": TokenMessage,
	"says":    TokenSays,
	"reply":   TokenReply,
	"with":    TokenWith,
	"embed":   TokenEmbed,
	"end":     TokenEnd,
	"start":   TokenStart,
	"token":   TokenToken,
	"set":     TokenSet,
	"to":      TokenTo,
	"user":    TokenUser,
	"member":  TokenMember,
	"ban":     TokenBan,
	"unban":   TokenUnban,
	"kick":    TokenKick,
	"for":     TokenFor,
	"timeout": TokenTimeout,
	"minutes": TokenMinutes,
	"add":     TokenAdd,
	"remove":  TokenRemove,
	"role":    TokenRole,
	"from":    TokenFrom,
	"send":    TokenSend,
	"channel": TokenChannel,
	"create":  TokenCreate,
	"thread":  TokenThread,
	"defer":     TokenDefer,
	"edit":      TokenEdit,
	"delete":    TokenDelete,
	"purge":     TokenPurge,
	"dm":        TokenDM,
	"messages":  TokenMessages,
	"nickname":  TokenNickname,
	"modal":     TokenModal,
	"titled":    TokenTitled,
	"submitted": TokenSubmitted,
	"menu":      TokenMenu,
	"options":   TokenOptions,
	"is":        TokenIs,
	"used":      TokenUsed,
	"created":   TokenCreated,
	"joins":     TokenJoins,
	"leaves":    TokenLeaves,
	"join":      TokenJoin,

		"voice":     TokenVoice,
		"play":      TokenPlay,
		"audio":     TokenAudio,
		"file":      TokenFile,
		"attachment":TokenAttachment,
                "if":        TokenIf,
                "has":       TokenHas,
                "permission":TokenPermission,
                "automod":   TokenAutomod,
                "rule":      TokenRule,
                "blocking":  TokenBlocking,
                "poll":      TokenPoll,
                "scheduled": TokenScheduled,
                "event":     TokenEvent,
                "emoji":     TokenEmoji,
                "starting":  TokenStarting,

                "webhook":   TokenWebhook,
                "via":       TokenVia,
                "sticker": TokenSticker,
                "info":    TokenInfo,
                "get":     TokenGet,
                "load":    TokenLoad,
                "include": TokenInclude,
                "package": TokenPackage,
                "npm":     TokenNpm,
                "python":  TokenPython,
                "as":      TokenAs,
                "mentionable": TokenMentionable,                "context":     TokenContext,
                "subcommand":  TokenSubcommand,
                "group":       TokenGroup,
                }
func LookupIdent(ident string) TokenType {
	if tok, ok := keywords[ident]; ok {
		return tok
	}
	return TokenIdent
}
