import json
import asyncio
import websockets

async def test():
    token = "DISCORD_TOKEN_HERE"
    uri = "wss://gateway.discord.gg/?v=10&encoding=json"
    async with websockets.connect(uri) as ws:
        hello = await ws.recv()
        print("Hello:", hello)
        
        payload = {
            "op": 2,
            "d": {
                "token": token,
                "intents": 33281, # Guilds | GuildMessages | MessageContent
                "properties": {
                    "os": "linux",
                    "browser": "ezbot",
                    "device": "ezbot"
                }
            }
        }
        await ws.send(json.dumps(payload))
        
        while True:
            try:
                res = await ws.recv()
                print("Recv:", res)
            except Exception as e:
                print("Error:", e)
                break

asyncio.run(test())
