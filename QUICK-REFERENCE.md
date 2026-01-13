# Discord Bot Quick Reference

## All Available Commands (prefix: `!`)

### 📋 Basic Commands
```
!help              - Show all commands
!info              - Bot information & stats
!ping              - Test bot responsiveness
!dice              - Roll a 6-sided dice
!flip              - Flip a coin
!random            - Generate random number (1-100)
```

### 🎨 Discord API Test Commands
```
!testembed         - Rich embed with all features
!testbuttons       - All 5 button styles + interactions
!testselect        - Single & multi-select menus
!testmodal         - Modal form with validation
!testall           - Combined: embed + buttons + select
!testuserselect    - User picker menu
!testroleselect    - Role picker menu
!testchannelselect - Channel picker menu
```

### 🔧 Admin Commands (Administrator permission required)
```
!setname <name>           - Change bot username
!setstatus <status>       - online|idle|dnd|invisible
!setactivity <type> <text> - playing|watching|listening|competing
!setavatar <url>          - Change avatar from image URL
```

## Quick Test Sequence

1. **Start**: `!help` (see all commands)
2. **Basic**: `!info` (bot stats)
3. **Embeds**: `!testembed` (rich formatting)
4. **Buttons**: `!testbuttons` → click all buttons
5. **Selects**: `!testselect` → try both menus
6. **Modal**: `!testmodal` → fill and submit form
7. **Combined**: `!testall` (all features together)
8. **Advanced**: `!testuserselect`, `!testroleselect`, `!testchannelselect`

## Feature Highlights

### Embeds
- Custom colors, titles, descriptions
- Author with avatar, footer with icon
- Inline & regular fields
- Thumbnail & main images
- Timestamps & URLs

### Buttons
- 5 styles: Primary, Secondary, Success, Danger, Link
- Custom emojis
- Ephemeral responses (only you see them)
- URL links

### Select Menus
- Single & multi-select
- String, User, Role, Channel types
- Custom emojis & descriptions
- Min/max selection limits

### Modals
- Popup forms
- Short & paragraph text inputs
- Required/optional fields
- Length validation

### Bot Settings
- Name, status, activity, avatar
- Real-time updates
- Permission-protected

## Code Location
- File: `src/runtime/builtins.ts`
- Lines: 21-36 (imports), 297-893 (implementation)
- Total: 614 lines added

## Documentation
- `DISCORD-API-TESTS.md` - Full command documentation
- `IMPLEMENTATION-SUMMARY.md` - Technical implementation details
- `QUICK-REFERENCE.md` - This file
