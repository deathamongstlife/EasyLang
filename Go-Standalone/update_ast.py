import sys

with open("internal/ast/ast.go", "r") as f:
    content = f.read()

new_ast_nodes = """
type JoinVoiceCommand struct {
	ChannelID Expression
}

func (s *JoinVoiceCommand) statementNode()       {}
func (s *JoinVoiceCommand) TokenLiteral() string { return "join voice channel" }

type PlayAudioCommand struct {
	AudioURL Expression
}

func (s *PlayAudioCommand) statementNode()       {}
func (s *PlayAudioCommand) TokenLiteral() string { return "play audio" }

type ReplyWithAttachmentCommand struct {
	FilePath Expression
}

func (s *ReplyWithAttachmentCommand) statementNode()       {}
func (s *ReplyWithAttachmentCommand) TokenLiteral() string { return "reply with file" }
"""

if "JoinVoiceCommand" not in content:
    with open("internal/ast/ast.go", "a") as f:
        f.write(new_ast_nodes)

with open("internal/lexer/token.go", "r") as f:
    content = f.read()

if "TokenJoin" not in content:
    content = content.replace('TokenUsed    TokenType = "USED"', 'TokenUsed    TokenType = "USED"\n\tTokenJoin TokenType = "JOIN"\n\tTokenVoice TokenType = "VOICE"\n\tTokenPlay TokenType = "PLAY"\n\tTokenAudio TokenType = "AUDIO"\n\tTokenFile TokenType = "FILE"\n\tTokenAttachment TokenType = "ATTACHMENT"')
    content = content.replace('"used":      TokenUsed,', '"used":      TokenUsed,\n\t\t"join":      TokenJoin,\n\t\t"voice":     TokenVoice,\n\t\t"play":      TokenPlay,\n\t\t"audio":     TokenAudio,\n\t\t"file":      TokenFile,\n\t\t"attachment":TokenAttachment,')
    with open("internal/lexer/token.go", "w") as f:
        f.write(content)

