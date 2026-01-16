---
layout: default
title: Interactive Tutorial
description: Learn EasyLang by coding in your browser
nav_order: 2
---

# 🎓 Interactive Tutorial

Welcome to EasyLang! Learn by writing real code in your browser. Complete each lesson to unlock the next one.

<div id="interactive-tutorial">
  <div class="tutorial-header">
    <h2 id="lesson-title">Loading...</h2>
    <div class="progress-bar">
      <div class="progress-fill" id="progress"></div>
    </div>
    <p id="lesson-description"></p>
  </div>

  <div class="tutorial-content">
    <div class="instructions-panel">
      <h3>📝 Instructions</h3>
      <p id="instructions"></p>
      <button id="hint-button" class="button secondary">💡 Show Hint</button>
      <div id="hint" class="hint hidden"></div>
    </div>

    <div class="editor-panel">
      <div class="editor-header">
        <span>✏️ Code Editor</span>
        <button id="reset-button" class="button secondary small">↻ Reset</button>
      </div>
      <textarea id="code-editor" class="code-editor" spellcheck="false"></textarea>
      <div class="editor-actions">
        <button id="run-button" class="button primary">▶ Run Code</button>
        <button id="solution-button" class="button secondary">👁️ Show Solution</button>
      </div>
    </div>

    <div class="output-panel">
      <h3>📤 Output</h3>
      <div id="output" class="output"></div>
      <div id="feedback" class="feedback hidden"></div>
    </div>
  </div>

  <div class="tutorial-navigation">
    <button id="prev-button" class="button secondary" disabled>← Previous</button>
    <span id="lesson-counter">Lesson 1 of 10</span>
    <button id="next-button" class="button primary" disabled>Next →</button>
  </div>

  <div class="completion-modal hidden" id="completion-modal">
    <div class="modal-content">
      <h2>🎉 Congratulations!</h2>
      <p>You've completed all the lessons!</p>
      <p class="certificate">You're now ready to build Discord bots with EasyLang!</p>
      <div class="modal-actions">
        <a href="../examples/" class="button primary">View Examples</a>
        <a href="../api/" class="button secondary">API Reference</a>
      </div>
    </div>
  </div>
</div>

<link rel="stylesheet" href="{{ '/assets/css/tutorial.css' | relative_url }}">
<script src="{{ '/assets/js/tutorial.js' | relative_url }}"></script>

## 🚀 What You'll Learn

- **Variables & Data Types** - Store and work with data
- **Functions** - Create reusable code blocks
- **Discord Messages** - Send and reply to messages
- **Embeds** - Create rich embedded messages
- **Conditionals** - Make decisions in your code
- **Loops** - Repeat actions efficiently
- **Reactions** - Add emoji reactions
- **Events** - Listen for Discord events
- **Buttons** - Create interactive buttons
- **Complete Bot** - Build a fully functional bot

## 💡 Tips for Success

- Read the instructions carefully
- Use the hint button if you're stuck
- Don't be afraid to experiment
- Check the solution if you need help
- Your progress is automatically saved

<div class="cta-box">
  <h3>Ready to start coding?</h3>
  <p>Scroll up to begin the interactive tutorial!</p>
</div>
