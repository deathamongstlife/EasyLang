# Tutorial Lesson Template

Use this template to create new lessons for the interactive tutorial.

## Lesson Object Structure

```javascript
{
  // Unique lesson identifier
  id: 1,

  // Lesson title (shown in header)
  title: "Lesson 1: Topic Name",

  // Brief description of what the lesson teaches
  description: "Learn to [skill] in EasyLang",

  // Clear, specific instructions for the learner
  // Should be actionable and measurable
  instructions: "Create a [thing] that does [action]. Use [syntax].",

  // Helpful guidance without revealing the answer
  // Should nudge learners in the right direction
  hint: "Remember to use the [keyword] and [pattern]",

  // Code that appears when lesson loads
  // Should include helpful comments
  starterCode: "// Write your code here\n// Example comment\n\n",

  // Working solution that solves the task
  // Should demonstrate best practices
  solution: 'var example = "solution"',

  // Validation function that checks if code is correct
  // Must return true for correct code, false otherwise
  validate: (code) => {
    // Check for required patterns
    const hasRequiredSyntax = /pattern/.test(code);
    const hasCorrectValue = code.includes('expected');

    return hasRequiredSyntax && hasCorrectValue;
  },

  // Encouraging message shown on success
  // Should celebrate and explain what they learned
  successMessage: "🎉 Excellent! You learned [concept]. This helps you [benefit].",

  // Helpful message shown on failure
  // Should guide without giving away the answer
  errorMessage: "Make sure you [specific guidance]. Check that [requirement]."
}
```

## Validation Best Practices

### Good Validation Examples

**Check for specific patterns:**
```javascript
validate: (code) => {
  // Look for function declaration
  return /function\s+\w+\s*\(/.test(code);
}
```

**Verify multiple requirements:**
```javascript
validate: (code) => {
  const hasVariable = /var\s+\w+\s*=/.test(code);
  const hasString = /"[^"]+"|'[^']+'/.test(code);
  return hasVariable && hasString;
}
```

**Check structure and content:**
```javascript
validate: (code) => {
  const hasListen = /listen\s+["']message["']/.test(code);
  const hasIf = /if\s+/.test(code);
  const hasReply = /reply\s+message/.test(code);
  return hasListen && hasIf && hasReply;
}
```

### Validation Patterns

Common regex patterns:

```javascript
// Variable declaration
/var\s+\w+\s*=/

// Function definition
/function\s+\w+\s*\([^)]*\)\s*\{/

// String literal
/"[^"]+"|'[^']+'/

// If statement
/if\s+.+\s*\{/

// For loop
/for\s+var\s+\w+/

// Discord commands
/reply\s+message/
/create_embed\(\)/
/listen\s+["']\w+["']/
```

## Instructions Best Practices

### Good Instructions
- ✅ "Create a variable called 'myName' with your name as a string."
- ✅ "Write a function that returns 'Hello'."
- ✅ "Reply to a message with 'Hello, Discord!'."

### Poor Instructions
- ❌ "Make a variable" (too vague)
- ❌ "Write some code" (no specific goal)
- ❌ "Do the thing correctly" (not actionable)

## Hint Best Practices

### Good Hints
- ✅ "Use: var variableName = value"
- ✅ "Functions start with the 'function' keyword"
- ✅ "Remember to use quotes around text"

### Poor Hints
- ❌ "Just write: var myName = 'Alice'" (gives away answer)
- ❌ "You need to code it" (too vague)
- ❌ "Check the documentation" (not helpful in context)

## Success Messages Best Practices

### Good Success Messages
- ✅ "🎉 Great! You created your first variable! Variables let you store data."
- ✅ "🎉 Perfect! Functions help you organize and reuse code."
- ✅ "🎉 Excellent! You can now respond to Discord events!"

### Poor Success Messages
- ❌ "Correct." (too brief)
- ❌ "Good job doing the thing." (not specific)
- ❌ "You did it!" (doesn't explain what they learned)

## Error Messages Best Practices

### Good Error Messages
- ✅ "Make sure you use 'var myName =' followed by a string in quotes."
- ✅ "Your function needs to return a value. Use 'return' inside the function."
- ✅ "Check that you're using the 'reply message' command."

### Poor Error Messages
- ❌ "Wrong." (not helpful)
- ❌ "Try again." (no guidance)
- ❌ "That's incorrect." (doesn't explain why)

## Lesson Difficulty Progression

### Beginner (Lessons 1-3)
- Single concept per lesson
- Clear, simple tasks
- Lots of guidance
- Basic syntax focus

### Intermediate (Lessons 4-7)
- Combine 2 concepts
- More complex patterns
- Less hand-holding
- Application-focused

### Advanced (Lessons 8-10)
- Multiple concepts together
- Real-world scenarios
- Minimal hints
- Complete implementations

## Starter Code Guidelines

### Good Starter Code
```javascript
// Comments guide the learner
// Show expected structure
// Leave room for their code

starterCode: "// Create a variable\n// Use var keyword\n\n"
```

### Avoid
```javascript
// Too much code given
// Solution is obvious

starterCode: "var myName = // finish this line\n"
```

## Testing Your Lesson

Before submitting, test that:
- [ ] Instructions are clear
- [ ] Validation catches correct answers
- [ ] Validation rejects incorrect answers
- [ ] Validation doesn't false-positive
- [ ] Hint is helpful but not giving away answer
- [ ] Solution works when copied
- [ ] Error message helps learners
- [ ] Success message is encouraging
- [ ] Starter code compiles/runs
- [ ] Lesson fits progression

## Example Complete Lesson

```javascript
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
}
```

## Adding Your Lesson

1. Copy this template
2. Fill in all fields
3. Test thoroughly
4. Add to `lessons` array in `tutorial.js`
5. Update lesson counter in UI
6. Test the full sequence
7. Submit pull request

## Questions?

If you need help creating a lesson:
1. Check existing lessons for examples
2. Review this template
3. Test with different user inputs
4. Ask for feedback before submitting

Happy lesson creating!
