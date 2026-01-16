# Persistent Storage

This directory contains runtime data for EasyLang's persistent component system.

## Files

### components.json

Stores metadata for persistent Discord components (buttons and select menus). This file is automatically managed by the system and should not be edited manually.

**Format:**
```json
{
  "button_1234567890_abc123": {
    "customId": "button_1234567890_abc123",
    "handlerName": "handle_click",
    "createdAt": 1704067200000,
    "expiresAt": 1704068100000,
    "state": {
      "message": "Hello",
      "counter": 42
    },
    "type": "button"
  }
}
```

**Fields:**
- `customId`: Unique identifier for the component
- `handlerName`: Name of the handler function
- `createdAt`: Creation timestamp (milliseconds since epoch)
- `expiresAt`: Expiration timestamp (Discord components expire after 15 minutes)
- `state`: Optional serializable state attached to component
- `type`: Component type ("button" or "select_menu")

## Auto-Cleanup

The system automatically:
- Removes expired components (older than 15 minutes)
- Saves handlers when created/updated
- Loads handlers on bot startup
- Runs cleanup every 5 minutes

## Security

This file is excluded from git (see `.gitignore`) because:
- It contains runtime data
- It may grow large with active bots
- It's regenerated automatically

## Troubleshooting

If components aren't persisting:
1. Check file permissions (should be writable)
2. Verify directory exists
3. Check for JSON syntax errors (if manually edited)
4. Review bot logs for errors

## See Also

- [Persistent Components Documentation](../../../docs/PERSISTENT_COMPONENTS.md)
- [Example Usage](../../../examples/persistent-components-example.ez)
