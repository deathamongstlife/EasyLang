---
layout: default
title: Home
description: EasyLang - A beginner-friendly programming language for Discord bot development
---

<div class="hero">
  <h1>EasyLang</h1>
  <p class="tagline">The beginner-friendly language for Discord bots</p>

  <div class="hero-buttons">
    <a href="{{ '/tutorial/' | relative_url }}" class="button primary">Start Tutorial</a>
    <a href="{{ '/getting-started/' | relative_url }}" class="button secondary">Get Started</a>
    <a href="{{ '/api/' | relative_url }}" class="button secondary">Documentation</a>
  </div>

  <div class="code-preview">
    <pre><code class="language-ezlang">// A complete Discord bot in just a few lines!
listen("ready", function() {
    print("Bot is online!")
})

listen("messageCreate", function(message) {
    if message.content == "!hello" {
        reply(message, "Hello! I'm a bot made with EasyLang!")
    }
})

bot_start("YOUR_TOKEN_HERE")</code></pre>
  </div>
</div>

## Why EasyLang?

<div class="features">
  <div class="feature-card">
    <h3>🎯 Beginner-Friendly</h3>
    <p>Simple, intuitive syntax that anyone can learn. No complex patterns or confusing APIs.</p>
    <ul>
      <li>Python-like syntax</li>
      <li>Easy to read and write</li>
      <li>Perfect for learning</li>
      <li>Quick to master</li>
    </ul>
  </div>

  <div class="feature-card">
    <h3>🤖 Discord-First</h3>
    <p>Every function is built specifically for Discord. No need to learn complex Discord.js APIs.</p>
    <ul>
      <li>148+ built-in functions</li>
      <li>All Discord features supported</li>
      <li>No external dependencies</li>
      <li>Just write and run</li>
    </ul>
  </div>

  <div class="feature-card">
    <h3>🎵 Voice Built-In</h3>
    <p>Play music and audio with simple commands. No complex setup required.</p>
    <ul>
      <li>YouTube integration</li>
      <li>Audio file playback</li>
      <li>Queue management</li>
      <li>Filters and effects</li>
    </ul>
  </div>

  <div class="feature-card">
    <h3>🔧 Python + NPM Bridge</h3>
    <p>Access thousands of packages seamlessly. Use any library without leaving EasyLang.</p>
    <ul>
      <li>Python packages</li>
      <li>NPM modules</li>
      <li>Seamless integration</li>
      <li>No complex setup</li>
    </ul>
  </div>

  <div class="feature-card">
    <h3>⚡ Modern Features</h3>
    <p>Full support for Discord's latest features including components, slash commands, and more.</p>
    <ul>
      <li>Buttons & select menus</li>
      <li>Slash commands</li>
      <li>Modals & forms</li>
      <li>Threads & forums</li>
    </ul>
  </div>

  <div class="feature-card">
    <h3>🛡️ AutoMod & Tools</h3>
    <p>Professional moderation tools built right in. Create powerful bots with ease.</p>
    <ul>
      <li>AutoMod rules</li>
      <li>Cooldown system</li>
      <li>Task scheduling</li>
      <li>Webhooks & polls</li>
    </ul>
  </div>
</div>

---

## 🎓 Learn by Doing

<div class="cta-box" style="background: linear-gradient(135deg, rgba(88, 101, 242, 0.1), rgba(59, 165, 93, 0.1)); padding: 2rem; border-radius: 12px; border: 2px solid #E3E5E8; margin: 2rem 0; text-align: center;">
  <h3 style="margin: 0 0 1rem 0;">Interactive Tutorial</h3>
  <p style="margin: 0 0 1.5rem 0; color: #5E6772;">Learn EasyLang by writing real code in your browser. Get instant feedback and progress at your own pace through 10 interactive lessons.</p>
  <a href="{{ '/tutorial/' | relative_url }}" class="button primary" style="display: inline-block; padding: 0.75rem 1.5rem; background: #5865F2; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Start Tutorial →</a>
</div>

---

## Quick Example

See how easy it is to create interactive bots with EasyLang:

```ezlang
listen("messageCreate", function(message) {
    if message.content == "!button" {
        // Create interactive buttons
        let button1 = create_button({
            "customId": "yes",
            "label": "Yes",
            "style": 3  // Green
        })

        let button2 = create_button({
            "customId": "no",
            "label": "No",
            "style": 4  // Red
        })

        let row = create_action_row([button1, button2])
        send_message(message.channel.id, "Do you like EasyLang?", null, [row])
    }
})

listen("interactionCreate", function(interaction) {
    if interaction.customId == "yes" {
        interaction_reply(interaction, "Great! 🎉", true)
    } else if interaction.customId == "no" {
        interaction_reply(interaction, "That's okay! 😊", true)
    }
})

bot_start(get_env("BOT_TOKEN"))
```

---

## Feature Highlights

<div class="features">
  <div class="feature-card">
    <h3>📨 Messaging</h3>
    <p>Send, edit, and manage messages with ease. Rich embeds, reactions, and more.</p>
    <a href="{{ '/features/messaging' | relative_url }}">Learn more →</a>
  </div>

  <div class="feature-card">
    <h3>🎮 Components</h3>
    <p>Buttons, select menus, and modals for interactive experiences.</p>
    <a href="{{ '/features/components' | relative_url }}">Learn more →</a>
  </div>

  <div class="feature-card">
    <h3>⚡ Slash Commands</h3>
    <p>Modern Discord commands with autocomplete and options.</p>
    <a href="{{ '/features/slash-commands' | relative_url }}">Learn more →</a>
  </div>

  <div class="feature-card">
    <h3>🎵 Voice & Audio</h3>
    <p>Play music, join voice channels, and manage audio playback.</p>
    <a href="{{ '/features/voice' | relative_url }}">Learn more →</a>
  </div>

  <div class="feature-card">
    <h3>🔨 Moderation</h3>
    <p>Kick, ban, timeout, and manage your server with powerful tools.</p>
    <a href="{{ '/features/moderation' | relative_url }}">Learn more →</a>
  </div>

  <div class="feature-card">
    <h3>⏰ Tasks & Loops</h3>
    <p>Background tasks, scheduled jobs, and periodic loops.</p>
    <a href="{{ '/features/tasks' | relative_url }}">Learn more →</a>
  </div>
</div>

---

## What Makes EasyLang Special?

<table>
  <thead>
    <tr>
      <th>Feature</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Simple Syntax</strong></td>
      <td>Easy to learn, Python-like syntax that makes sense</td>
    </tr>
    <tr>
      <td><strong>148+ Functions</strong></td>
      <td>Comprehensive Discord API coverage built-in</td>
    </tr>
    <tr>
      <td><strong>Voice Support</strong></td>
      <td>Play music and audio out of the box</td>
    </tr>
    <tr>
      <td><strong>Modern Features</strong></td>
      <td>Full support for components, slash commands, threads, and more</td>
    </tr>
    <tr>
      <td><strong>Bridge System</strong></td>
      <td>Access Python and NPM packages seamlessly</td>
    </tr>
    <tr>
      <td><strong>No Compilation</strong></td>
      <td>Run directly with Node.js - no build step required</td>
    </tr>
    <tr>
      <td><strong>AutoMod</strong></td>
      <td>Powerful moderation automation built right in</td>
    </tr>
    <tr>
      <td><strong>Open Source</strong></td>
      <td>Free and open source on GitHub</td>
    </tr>
  </tbody>
</table>

---

## Ready to Get Started?

<div class="text-center">
  <p style="font-size: 1.2rem; margin-bottom: 2rem;">
    Join developers creating powerful Discord bots with EasyLang's simple and intuitive syntax.
  </p>

  <a href="{{ '/getting-started/' | relative_url }}" class="btn btn-primary btn-lg">Get Started Now</a>
  <a href="{{ '/examples/' | relative_url }}" class="btn btn-secondary btn-lg">Browse Examples</a>
</div>

---

<div class="callout info">
  <h3>Need Help?</h3>
  <p>
    Check out our <a href="{{ '/getting-started/' | relative_url }}">Getting Started guide</a> for installation instructions and your first bot.
    Browse the <a href="{{ '/api/' | relative_url }}">API Reference</a> for detailed documentation of all 148+ functions.
  </p>
</div>

---

<div class="text-center text-muted">
  <p>EasyLang is an open-source project. Contributions welcome on <a href="https://github.com/{{ site.repository }}">GitHub</a>.</p>
</div>
