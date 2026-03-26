# Context and Goal
I have built a custom programming language called **EzLang**, a natural-language interpreter written natively in **Go** that interacts with the Discord API (v10) without any wrappers like `discord.js`.

The Go engine (located at `/root/EZLang/Go-Standalone`) has a custom Lexer, Parser, AST, and Runtime that reads `.ez` files. It has native commands like `when message says "!ping"`, `reply with embed`, `create webhook`, and `load npm package "canvas" as canvas` (handled via an IPC bridge). 

I have a repository for a massive open-source Discord bot called **REAPER-2.0** (located at `/root/EZLang/Go-Standalone/REAPER-2.0`).

Your goal is to perform a **1:1 rewrite** of REAPER-2.0 from its original JavaScript/`discord.js` implementation into native **EzLang** (`.ez`) code.

# Instructions
1. **Analyze the Repository:** Traverse `/root/EZLang/Go-Standalone/REAPER-2.0`. Examine how the handlers (`loadCommands.js`, `loadEvents.js`), config files, and the various Command folders (`Info`, `Mod`, `Fun`, `Music`, etc.) are structured.
2. **Rewrite Architecture:** Convert the Javascript module system to the EzLang `include` system. Convert the `index.js` entry point into `index.ez`.
3. **Rewrite Commands:** For every Javascript command file (e.g. `Commands/Mod/ban.js`), create an equivalent `Commands/Mod/ban.ez` file.
4. **Utilize EzLang Syntax:** You must translate Javascript `client.on(...)` or `message.reply(...)` into pure EzLang syntax. 
   - Examples to use:
     - `when message starts with "!ban"`
     - `reply with embed "Title" "Description"`
     - `if user has permission "BAN_MEMBERS" then`
     - `ban user target_user for reason`
5. **Handle Node Packages:** For commands that require complex Node modules (like `canvas` or `discord-player`), use the EzLang syntax `load npm package "package_name" as alias` to proxy the functionality.
6. **Identify Missing Features:** If REAPER-2.0 utilizes a Discord API feature or logical evaluation that does not yet exist in the Go EzLang parser, **you must first implement it in the Go engine** (`internal/parser/`, `internal/ast/`, `internal/runtime/`) before writing the `.ez` script for it.
7. **Deploy Subagents:** Because REAPER-2.0 is massive (hundreds of commands), use the `generalist` subagent aggressively to batch-convert entire folders of commands (e.g., "Convert all Info commands", "Convert all Music commands") concurrently.

# Final Deliverable
A fully functioning, modular `/root/EZLang/Go-Standalone/REAPER-2.0` directory consisting entirely of `.ez` files that replicate the exact functionality of the original JavaScript bot, capable of being executed by running `./ezbot run REAPER-2.0/index.ez`.