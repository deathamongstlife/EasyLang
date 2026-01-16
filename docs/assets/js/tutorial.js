/**
 * Interactive Tutorial System for EasyLang
 * Provides browser-based code editor with instant feedback
 */

const lessons = [
  {
    id: 1,
    title: "Lesson 1: Variables",
    description: "Learn to create and store data in variables",
    instructions: "Create a variable called 'myName' with your name as a string. Use double quotes around your name.",
    hint: "Use the syntax: var variableName = \"value\"",
    starterCode: "// Write your code here\n// Example: var myName = \"Alice\"\n\n",
    solution: 'var myName = "Alice"',
    validate: (code) => {
      const hasVar = /var\s+myName\s*=/.test(code);
      const hasString = /"[^"]+"|'[^']+'/.test(code);
      return hasVar && hasString;
    },
    successMessage: "🎉 Great! You created your first variable! Variables let you store data for later use.",
    errorMessage: "Make sure you use 'var myName = ' followed by a string in quotes."
  },
  {
    id: 2,
    title: "Lesson 2: Functions",
    description: "Create reusable blocks of code with functions",
    instructions: "Create a function called 'greet' that returns the string \"Hello\".",
    hint: "Functions are defined with: function name() { return value }",
    starterCode: "// Create your greet function\n// It should return \"Hello\"\n\n",
    solution: 'function greet() {\n  return "Hello"\n}',
    validate: (code) => {
      const hasFunction = /function\s+greet\s*\(/.test(code);
      const hasReturn = /return\s+["']Hello["']/.test(code);
      return hasFunction && hasReturn;
    },
    successMessage: "🎉 Excellent! You can now create functions! Functions help organize and reuse code.",
    errorMessage: "Make sure your function is named 'greet' and returns \"Hello\"."
  },
  {
    id: 3,
    title: "Lesson 3: Discord Messages",
    description: "Learn to reply to messages in Discord",
    instructions: "Reply to a Discord message with the text \"Hello, Discord!\"",
    hint: "Use: reply message \"your text here\"",
    starterCode: "// Reply to the message\n// Use the reply message command\n\n",
    solution: 'reply message "Hello, Discord!"',
    validate: (code) => {
      const hasReply = /reply\s+message\s+["']/.test(code);
      return hasReply;
    },
    successMessage: "🎉 Perfect! You can now reply to messages! This is the foundation of bot interactions.",
    errorMessage: "Use the 'reply message' command followed by your message in quotes."
  },
  {
    id: 4,
    title: "Lesson 4: Creating Embeds",
    description: "Create rich embedded messages with embeds",
    instructions: "Create an embed and set its title to \"Welcome\". You'll need two commands: create_embed() and embed_set_title().",
    hint: "First create the embed with var embed = create_embed(), then use embed_set_title(embed, \"title\")",
    starterCode: "// Create an embed\n// Then set its title to \"Welcome\"\n\n",
    solution: 'var embed = create_embed()\nembed_set_title(embed, "Welcome")',
    validate: (code) => {
      const hasCreate = /create_embed\s*\(\s*\)/.test(code);
      const hasTitle = /embed_set_title/.test(code);
      return hasCreate && hasTitle;
    },
    successMessage: "🎉 Amazing! You created your first embed! Embeds make messages look professional.",
    errorMessage: "You need to create an embed and set its title using both functions."
  },
  {
    id: 5,
    title: "Lesson 5: Conditions",
    description: "Make decisions in your code with if statements",
    instructions: "Write an if statement that checks if message.content equals \"!help\" and replies with \"Help is here!\"",
    hint: "Use: if condition { action }. Check equality with ==",
    starterCode: "// Check if message content is \"!help\"\n// If it is, reply with \"Help is here!\"\n\n",
    solution: 'if message.content == "!help" {\n  reply message "Help is here!"\n}',
    validate: (code) => {
      const hasIf = /if\s+/.test(code);
      const hasMessageContent = /message\.content/.test(code);
      const hasEquality = /==/.test(code);
      return hasIf && hasMessageContent && hasEquality;
    },
    successMessage: "🎉 Well done! You can now make decisions in your code! Conditions are essential for bot logic.",
    errorMessage: "Use an if statement to check message.content with == operator."
  },
  {
    id: 6,
    title: "Lesson 6: Loops",
    description: "Repeat actions with for loops",
    instructions: "Create a for loop that counts from 1 to 5. Use the variable 'i' as your counter.",
    hint: "Use: for var i = start; i <= end; i = i + 1 { }",
    starterCode: "// Create a for loop from 1 to 5\n// Use variable i as the counter\n\n",
    solution: 'for var i = 1; i <= 5; i = i + 1 {\n  // Loop body\n}',
    validate: (code) => {
      const hasFor = /for\s+var\s+i/.test(code);
      const hasCondition = /i\s*<=\s*5/.test(code);
      const hasIncrement = /i\s*=\s*i\s*\+\s*1/.test(code);
      return hasFor && hasCondition && hasIncrement;
    },
    successMessage: "🎉 Fantastic! You mastered loops! Loops let you repeat actions efficiently.",
    errorMessage: "Create a for loop with i starting at 1, ending at 5, incrementing by 1."
  },
  {
    id: 7,
    title: "Lesson 7: Reactions",
    description: "Add emoji reactions to messages",
    instructions: "Add a thumbs up reaction (👍) to a message. Use the add_reaction function.",
    hint: "Use: add_reaction(message, \"emoji\")",
    starterCode: "// Add a thumbs up reaction to the message\n// The emoji is: 👍\n\n",
    solution: 'add_reaction(message, "👍")',
    validate: (code) => {
      const hasAddReaction = /add_reaction/.test(code);
      const hasMessage = /message/.test(code);
      return hasAddReaction && hasMessage;
    },
    successMessage: "🎉 Awesome! You can now add reactions! Reactions are great for quick feedback.",
    errorMessage: "Use add_reaction with message and an emoji."
  },
  {
    id: 8,
    title: "Lesson 8: Event Listeners",
    description: "Listen for Discord events",
    instructions: "Create an event listener for the \"message\" event. Use the listen keyword.",
    hint: "Use: listen \"event_name\" { }",
    starterCode: "// Listen for message events\n// Use the listen keyword\n\n",
    solution: 'listen "message" {\n  // Handle message event\n}',
    validate: (code) => {
      const hasListen = /listen\s+["']message["']/.test(code);
      const hasBraces = /\{[\s\S]*\}/.test(code);
      return hasListen && hasBraces;
    },
    successMessage: "🎉 Incredible! You can now listen to events! This is how bots respond to Discord activity.",
    errorMessage: "Use the listen keyword with \"message\" in quotes, followed by { }."
  },
  {
    id: 9,
    title: "Lesson 9: Interactive Buttons",
    description: "Create interactive button components",
    instructions: "Create a button with the label \"Click Me\" and custom_id \"my_button\". Use create_button().",
    hint: "Use: var button = create_button(\"label\", \"custom_id\")",
    starterCode: "// Create a button with label \"Click Me\"\n// Set custom_id to \"my_button\"\n\n",
    solution: 'var button = create_button("Click Me", "my_button")',
    validate: (code) => {
      const hasButton = /create_button/.test(code);
      const hasLabel = /["']Click Me["']/.test(code);
      const hasCustomId = /["']my_button["']/.test(code);
      return hasButton && hasLabel && hasCustomId;
    },
    successMessage: "🎉 Outstanding! You can now create buttons! Buttons make bots interactive and fun.",
    errorMessage: "Use create_button with a label and custom_id in quotes."
  },
  {
    id: 10,
    title: "Lesson 10: Complete Bot",
    description: "Put it all together - build a complete bot",
    instructions: "Create a complete bot that listens for messages and replies when someone says \"!hello\". Include an if statement inside the listen block.",
    hint: "Combine listen, if condition, and reply message. Check if message.content == \"!hello\"",
    starterCode: "// Create a complete bot\n// Listen for messages\n// Check if content is \"!hello\"\n// Reply with a greeting\n\n",
    solution: 'listen "message" {\n  if message.content == "!hello" {\n    reply message "Hello there!"\n  }\n}',
    validate: (code) => {
      const hasListen = /listen\s+["']message["']/.test(code);
      const hasIf = /if\s+message\.content/.test(code);
      const hasReply = /reply\s+message/.test(code);
      return hasListen && hasIf && hasReply;
    },
    successMessage: "🎉🎉🎉 CONGRATULATIONS! You've completed all lessons! You're now ready to build amazing Discord bots with EasyLang!",
    errorMessage: "Combine a listen block with an if statement that checks message.content and uses reply message."
  }
];

class InteractiveTutorial {
  constructor() {
    this.currentLesson = 0;
    this.completedLessons = new Set();
    this.loadProgress();
    this.initializeUI();
    this.loadLesson(this.currentLesson);
  }

  initializeUI() {
    // Get DOM elements
    this.elements = {
      title: document.getElementById('lesson-title'),
      description: document.getElementById('lesson-description'),
      instructions: document.getElementById('instructions'),
      hint: document.getElementById('hint'),
      hintButton: document.getElementById('hint-button'),
      editor: document.getElementById('code-editor'),
      output: document.getElementById('output'),
      feedback: document.getElementById('feedback'),
      progress: document.getElementById('progress'),
      counter: document.getElementById('lesson-counter'),
      runButton: document.getElementById('run-button'),
      resetButton: document.getElementById('reset-button'),
      solutionButton: document.getElementById('solution-button'),
      prevButton: document.getElementById('prev-button'),
      nextButton: document.getElementById('next-button'),
      completionModal: document.getElementById('completion-modal')
    };

    // Add event listeners
    this.elements.runButton.addEventListener('click', () => this.runCode());
    this.elements.resetButton.addEventListener('click', () => this.resetCode());
    this.elements.solutionButton.addEventListener('click', () => this.showSolution());
    this.elements.hintButton.addEventListener('click', () => this.toggleHint());
    this.elements.prevButton.addEventListener('click', () => this.previousLesson());
    this.elements.nextButton.addEventListener('click', () => this.nextLesson());

    // Keyboard shortcuts
    this.elements.editor.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        this.runCode();
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        const value = e.target.value;
        e.target.value = value.substring(0, start) + '  ' + value.substring(end);
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }
    });

    // Auto-save code
    this.elements.editor.addEventListener('input', () => {
      this.saveProgress();
    });
  }

  loadLesson(index) {
    if (index < 0 || index >= lessons.length) return;

    this.currentLesson = index;
    const lesson = lessons[index];

    // Update UI
    this.elements.title.textContent = lesson.title;
    this.elements.description.textContent = lesson.description;
    this.elements.instructions.textContent = lesson.instructions;
    this.elements.hint.textContent = lesson.hint;
    this.elements.hint.classList.add('hidden');
    this.elements.hintButton.textContent = '💡 Show Hint';

    // Load saved code or starter code
    const savedCode = this.getSavedCode(index);
    this.elements.editor.value = savedCode || lesson.starterCode;

    // Clear output
    this.elements.output.textContent = '';
    this.elements.output.className = 'output';
    this.elements.feedback.textContent = '';
    this.elements.feedback.classList.add('hidden');

    // Update progress bar
    const progress = (this.completedLessons.size / lessons.length) * 100;
    this.elements.progress.style.width = `${progress}%`;

    // Update counter
    this.elements.counter.textContent = `Lesson ${index + 1} of ${lessons.length}`;

    // Update navigation buttons
    this.elements.prevButton.disabled = index === 0;
    this.elements.nextButton.disabled = !this.completedLessons.has(index);

    // Focus editor
    this.elements.editor.focus();
  }

  runCode() {
    const code = this.elements.editor.value.trim();
    const lesson = lessons[this.currentLesson];

    if (!code) {
      this.showError('Please write some code first!');
      return;
    }

    // Validate code
    const isValid = lesson.validate(code);

    if (isValid) {
      this.showSuccess(lesson.successMessage);
      this.completedLessons.add(this.currentLesson);
      this.saveProgress();

      // Enable next button
      if (this.currentLesson < lessons.length - 1) {
        this.elements.nextButton.disabled = false;
      }

      // Check if all lessons completed
      if (this.completedLessons.size === lessons.length) {
        setTimeout(() => this.showCompletionModal(), 1500);
      }
    } else {
      this.showError(lesson.errorMessage);
    }
  }

  showSuccess(message) {
    this.elements.output.textContent = `✅ Success!\n\n${message}`;
    this.elements.output.className = 'output success';

    // Celebration animation
    this.elements.output.style.animation = 'none';
    setTimeout(() => {
      this.elements.output.style.animation = '';
    }, 10);
  }

  showError(message) {
    this.elements.output.textContent = `❌ Not quite right.\n\n${message}`;
    this.elements.output.className = 'output error';
  }

  resetCode() {
    const lesson = lessons[this.currentLesson];
    this.elements.editor.value = lesson.starterCode;
    this.elements.output.textContent = '';
    this.elements.output.className = 'output';
    this.saveProgress();
  }

  showSolution() {
    const lesson = lessons[this.currentLesson];
    this.elements.editor.value = lesson.solution;
    this.elements.output.textContent = '💡 Solution loaded! Try to understand how it works, then modify it to make it your own.';
    this.elements.output.className = 'output';
    this.saveProgress();
  }

  toggleHint() {
    const isHidden = this.elements.hint.classList.contains('hidden');
    if (isHidden) {
      this.elements.hint.classList.remove('hidden');
      this.elements.hintButton.textContent = '🙈 Hide Hint';
    } else {
      this.elements.hint.classList.add('hidden');
      this.elements.hintButton.textContent = '💡 Show Hint';
    }
  }

  previousLesson() {
    if (this.currentLesson > 0) {
      this.loadLesson(this.currentLesson - 1);
    }
  }

  nextLesson() {
    if (this.currentLesson < lessons.length - 1) {
      this.loadLesson(this.currentLesson + 1);
    }
  }

  showCompletionModal() {
    this.elements.completionModal.classList.remove('hidden');

    // Add confetti effect
    this.createConfetti();
  }

  createConfetti() {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 5000);
      }, i * 30);
    }
  }

  // Local storage for progress
  saveProgress() {
    const progress = {
      currentLesson: this.currentLesson,
      completedLessons: Array.from(this.completedLessons),
      savedCode: {}
    };

    // Save code for each lesson
    lessons.forEach((_, index) => {
      const code = this.getSavedCode(index);
      if (code) {
        progress.savedCode[index] = code;
      }
    });

    // Save current code
    progress.savedCode[this.currentLesson] = this.elements.editor.value;

    localStorage.setItem('easylang-tutorial-progress', JSON.stringify(progress));
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem('easylang-tutorial-progress');
      if (saved) {
        const progress = JSON.parse(saved);
        this.currentLesson = progress.currentLesson || 0;
        this.completedLessons = new Set(progress.completedLessons || []);
        this.savedCodeCache = progress.savedCode || {};
      }
    } catch (e) {
      console.error('Failed to load progress:', e);
    }
  }

  getSavedCode(index) {
    return this.savedCodeCache?.[index] || '';
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('interactive-tutorial')) {
    new InteractiveTutorial();
  }
});

// Easter eggs
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
  if (e.key === konamiCode[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      alert('🎮 You found the secret! You are a true coding master!');
      konamiIndex = 0;
    }
  } else {
    konamiIndex = 0;
  }
});
