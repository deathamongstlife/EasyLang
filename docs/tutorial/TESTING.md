# Testing Guide for Interactive Tutorial

This guide helps you test the interactive tutorial system to ensure everything works correctly.

## Pre-Testing Checklist

Before testing, ensure:
- [ ] Jekyll is installed and running (`bundle exec jekyll serve`)
- [ ] Browser console is open (F12) to check for errors
- [ ] Testing in multiple browsers (Chrome, Firefox, Safari)
- [ ] Testing on mobile devices or responsive mode

## Manual Testing Procedures

### 1. Initial Load Test
**What to test:**
- [ ] Page loads without errors
- [ ] All UI elements are visible
- [ ] Tutorial title displays "Lesson 1: Variables"
- [ ] Code editor is editable
- [ ] Progress bar shows at 0%
- [ ] Lesson counter shows "Lesson 1 of 10"

**Expected behavior:**
- Clean page load with no console errors
- All buttons are interactive
- Editor has starter code with comments

### 2. Lesson 1: Variables Test
**Test valid code:**
```javascript
var myName = "Alice"
```

**Expected:**
- [ ] Success message appears
- [ ] Output shows green success box
- [ ] Next button becomes enabled
- [ ] Progress bar updates

**Test invalid code:**
```javascript
myName = "Alice"
```

**Expected:**
- [ ] Error message appears
- [ ] Output shows red error box
- [ ] Helpful guidance is displayed
- [ ] Next button stays disabled

### 3. Lesson 2: Functions Test
**Test valid code:**
```javascript
function greet() {
  return "Hello"
}
```

**Expected:**
- [ ] Success message appears
- [ ] Validation recognizes function syntax
- [ ] Return statement detected

**Test invalid variations:**
```javascript
// Missing return
function greet() {
  "Hello"
}

// Wrong name
function hello() {
  return "Hello"
}
```

### 4. Navigation Tests

**Previous Button:**
- [ ] Disabled on lesson 1
- [ ] Enabled on lesson 2+
- [ ] Loads previous lesson correctly
- [ ] Preserves saved code

**Next Button:**
- [ ] Disabled until lesson complete
- [ ] Enables after successful validation
- [ ] Loads next lesson correctly
- [ ] Increments lesson counter

**Lesson Counter:**
- [ ] Updates correctly on navigation
- [ ] Shows "X of 10" format
- [ ] Matches current lesson

### 5. Progress Persistence Tests

**Save on input:**
1. Write code in editor
2. Navigate to different lesson
3. Return to original lesson
4. **Expected:** Code is preserved

**Save completed lessons:**
1. Complete lesson 1
2. Refresh the page
3. **Expected:**
   - Progress bar shows completion
   - Next button is enabled
   - Can navigate to lesson 2

**Clear progress:**
1. Open browser DevTools
2. Run: `localStorage.clear()`
3. Refresh page
4. **Expected:** Back to lesson 1, no progress

### 6. Hint System Tests

**Show hint:**
- [ ] Click "💡 Show Hint"
- [ ] Hint text appears
- [ ] Button text changes to "🙈 Hide Hint"

**Hide hint:**
- [ ] Click "🙈 Hide Hint"
- [ ] Hint disappears
- [ ] Button text changes to "💡 Show Hint"

### 7. Solution Tests

**View solution:**
- [ ] Click "👁️ Show Solution"
- [ ] Solution code loads into editor
- [ ] Informational message appears
- [ ] Can run solution successfully

### 8. Reset Tests

**Reset code:**
- [ ] Write custom code
- [ ] Click "↻ Reset"
- [ ] Editor returns to starter code
- [ ] Output clears
- [ ] Can write new code

### 9. Keyboard Shortcuts Tests

**Ctrl+Enter (Run):**
- [ ] Press Ctrl+Enter in editor
- [ ] Code runs and validates
- [ ] Same behavior as clicking Run button

**Tab (Indent):**
- [ ] Press Tab in editor
- [ ] Two spaces inserted
- [ ] Cursor position correct
- [ ] No focus loss

### 10. Complete All Lessons Test

**Complete sequence:**
1. Complete lessons 1-9 sequentially
2. Complete lesson 10
3. **Expected:**
   - Completion modal appears
   - Confetti animation plays
   - Links to examples and API visible
   - Progress bar at 100%

### 11. Responsive Design Tests

**Desktop (1920x1080):**
- [ ] 3-column layout displays
- [ ] All panels visible
- [ ] No horizontal scroll

**Tablet (768x1024):**
- [ ] 2-column layout
- [ ] Instructions span full width
- [ ] Editor and output side-by-side

**Mobile (375x667):**
- [ ] Single column layout
- [ ] All elements stack vertically
- [ ] Buttons are touch-friendly
- [ ] Text is readable

### 12. Dark Mode Tests

**System dark mode:**
1. Enable system dark mode
2. Refresh tutorial page
3. **Expected:**
   - Dark background colors
   - Light text colors
   - Good contrast maintained
   - Code editor adapts

### 13. Accessibility Tests

**Keyboard navigation:**
- [ ] Tab through all interactive elements
- [ ] Focus indicators visible
- [ ] Can activate buttons with Enter/Space
- [ ] No keyboard traps

**Screen reader:**
- [ ] Headings are announced
- [ ] Button labels are clear
- [ ] Instructions are readable
- [ ] Status messages announced

**High contrast mode:**
1. Enable system high contrast
2. **Expected:**
   - Borders are thicker
   - Colors maintain contrast
   - Text is readable

### 14. Performance Tests

**Load time:**
- [ ] Page loads in < 2 seconds
- [ ] No layout shift during load
- [ ] Animations are smooth

**Interaction speed:**
- [ ] Run button responds instantly
- [ ] Navigation is smooth
- [ ] No lag when typing

### 15. Browser Compatibility Tests

Test in each browser:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Automated Testing (Future)

Consider adding:
```javascript
// Example test suite structure
describe('Tutorial System', () => {
  test('validates lesson 1 correctly', () => {
    const code = 'var myName = "Alice"';
    expect(lessons[0].validate(code)).toBe(true);
  });

  test('rejects invalid lesson 1 code', () => {
    const code = 'myName = "Alice"';
    expect(lessons[0].validate(code)).toBe(false);
  });
});
```

## Common Issues and Fixes

### Issue: Code doesn't save
**Fix:** Check browser localStorage is enabled
```javascript
// Test in console:
localStorage.setItem('test', 'value');
console.log(localStorage.getItem('test'));
```

### Issue: Animations don't play
**Fix:** Check for `prefers-reduced-motion` setting
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; }
}
```

### Issue: Progress bar doesn't update
**Fix:** Verify `completedLessons` Set is working
```javascript
// Check in console:
console.log(tutorial.completedLessons);
```

### Issue: Validation always fails
**Fix:** Check regex patterns in validate()
```javascript
// Test regex in console:
const code = 'var myName = "Alice"';
console.log(/var\s+myName\s*=/.test(code));
```

## Regression Testing

When updating lessons, test:
- [ ] All previous lessons still work
- [ ] Navigation between old and new lessons
- [ ] Progress from previous version loads
- [ ] No breaking changes in validation

## User Acceptance Testing

Get feedback on:
- [ ] Instructions clarity
- [ ] Hint usefulness
- [ ] Error message helpfulness
- [ ] Overall learning experience
- [ ] Difficulty progression

## Bug Reporting Template

When reporting bugs, include:
```
**Browser:** Chrome 120
**OS:** Windows 11
**Lesson:** Lesson 3
**Steps to reproduce:**
1. Step one
2. Step two
3. Step three

**Expected:** What should happen
**Actual:** What actually happened
**Console errors:** [paste errors]
**Screenshot:** [attach if relevant]
```

## Testing Checklist Summary

Quick checklist for full test:
- [ ] All 10 lessons load correctly
- [ ] Valid code passes validation
- [ ] Invalid code fails validation
- [ ] Progress saves and loads
- [ ] Navigation works in all directions
- [ ] Hints toggle correctly
- [ ] Solutions load correctly
- [ ] Reset works on all lessons
- [ ] Keyboard shortcuts work
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] Accessibility features work
- [ ] Performance is acceptable
- [ ] Cross-browser compatible

## Next Steps After Testing

1. Document all found issues
2. Create GitHub issues for bugs
3. Prioritize fixes (critical vs. nice-to-have)
4. Test fixes thoroughly
5. Get user feedback
6. Iterate and improve

Happy testing!
