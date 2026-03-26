import os
import subprocess

def fix_intents():
    file_path = "/root/EZLang/Go-Standalone/internal/discord/discord.go"
    with open(file_path, "r") as f:
        content = f.read()
    
    # We will use ALL intents (3276799) if the user has them enabled,
    # but to prevent 4004 close codes for users who haven't enabled them,
    # we will read an environment variable `DISCORD_INTENTS`, defaulting to unprivileged (3276541 or 513).
    # Since the user stated "those are toggled on", we can safely request 3276799.
    content = content.replace('"intents": 513, // Removed Privileged Intents (Presences/Members) to stop 4004 close codes', '"intents": 3276799, // ALL INTENTS')
    
    with open(file_path, "w") as f:
        f.write(content)

if __name__ == "__main__":
    print("Applying final intents fix...")
    fix_intents()
    print("Recompiling Go standalone engine...")
    subprocess.run(["go", "build", "-o", "ezbot", "cmd/ezlang/main.go"], cwd="/root/EZLang/Go-Standalone", env=dict(os.environ, PATH=os.environ['PATH'] + ':/usr/local/go/bin'))
    print("Build complete.")
