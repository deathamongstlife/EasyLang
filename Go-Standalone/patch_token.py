import sys

with open('/root/EZLang/Go-Standalone/internal/lexer/token.go', 'r') as f:
    content = f.read()

# Add to constants
const_addition = """        TokenPoll TokenType = "POLL"
        TokenScheduled TokenType = "SCHEDULED"
        TokenEvent TokenType = "EVENT"
        TokenEmoji TokenType = "EMOJI"
        TokenStarting TokenType = "STARTING"
"""
content = content.replace("TokenBlocking TokenType = \"BLOCKING\"", "TokenBlocking TokenType = \"BLOCKING\"\n" + const_addition)

# Add to keywords
keyword_addition = """                "poll":      TokenPoll,
                "scheduled": TokenScheduled,
                "event":     TokenEvent,
                "emoji":     TokenEmoji,
                "starting":  TokenStarting,
"""
content = content.replace("\"blocking\":  TokenBlocking,", "\"blocking\":  TokenBlocking,\n" + keyword_addition)

with open('/root/EZLang/Go-Standalone/internal/lexer/token.go', 'w') as f:
    f.write(content)

print("token.go patched")
