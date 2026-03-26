# Architecture of EzLang

EzLang is an interpreted programming language. When you run `./ezbot run script.ez`, the Go runtime executes a 4-step compilation and evaluation pipeline.

## 1. The Lexer (`internal/lexer/`)
The Lexer reads your `.ez` text file byte-by-byte. It ignores whitespace and groups characters into "Tokens".
Because EzLang uses Natural Language Processing (NLP), the Lexer has "Soft Keywords".
* **Soft Keywords** mean that words like `user`, `message`, and `role` act as operators when used in commands (e.g. `ban user`), but act as normal variables when used in objects (e.g. `interaction.user`).

## 2. The Parser (`internal/parser/`)
The Parser takes the tokens and builds an Abstract Syntax Tree (AST). 
It uses a Recursive Descent approach, meaning it checks the first word, guesses what command you are trying to write, and ensures the rest of the sentence makes grammatical sense.
* If you type `reply with embed`, the Parser expects two string values afterward (Title and Description). If they are missing, it throws a syntax error before the bot ever turns on.

## 3. The Runtime Engine (`internal/runtime/`)
The Runtime walks down the AST and executes the logic. It maintains an `Environment` struct, which is basically a map of variables currently stored in RAM. 
When it sees a Discord command, it interfaces directly with the `discordClient`.

## 4. The Native Discord Client (`internal/discord/`)
Unlike Node.js bots, there is no `discord.js` running in the background.
We wrote raw HTTP POST and WebSocket upgrade requests natively in Go. 

When you write `reply with "Hello"`, the Go engine translates that into:
```json
POST /api/v10/channels/{id}/messages
{
  "content": "Hello"
}
```

This makes the language incredibly lightweight, fast, and immune to breaking changes in NPM packages.
