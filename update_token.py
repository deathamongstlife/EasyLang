import sys

with open('/root/EZLang/Go-Standalone/internal/lexer/token.go', 'r') as f:
    content = f.read()

# insert TokenIf etc after TokenAttachment
insert_tokens = """
        TokenIf TokenType = "IF"
        TokenHas TokenType = "HAS"
        TokenPermission TokenType = "PERMISSION"
        TokenAutomod TokenType = "AUTOMOD"
        TokenRule TokenType = "RULE"
        TokenBlocking TokenType = "BLOCKING"
"""
content = content.replace('TokenAttachment TokenType = "ATTACHMENT"', 'TokenAttachment TokenType = "ATTACHMENT"' + insert_tokens)

insert_keywords = """
                "if":        TokenIf,
                "has":       TokenHas,
                "permission":TokenPermission,
                "automod":   TokenAutomod,
                "rule":      TokenRule,
                "blocking":  TokenBlocking,
"""
content = content.replace('"attachment":TokenAttachment,', '"attachment":TokenAttachment,' + insert_keywords)

with open('/root/EZLang/Go-Standalone/internal/lexer/token.go', 'w') as f:
    f.write(content)
