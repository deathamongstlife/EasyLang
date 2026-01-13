# Manual Testing for get_argument()

## Test Cases

### 1. Test without arguments (should use defaults)
```bash
npm run build && node dist/index.js run examples/command-line-args.ezlang
```
Expected: All default values should be displayed

### 2. Test with single argument
```bash
npm run build && node dist/index.js run examples/command-line-args.ezlang TOKEN=test123
```
Expected: TOKEN should be "test123", others use defaults

### 3. Test with multiple arguments
```bash
npm run build && node dist/index.js run examples/command-line-args.ezlang TOKEN=abc123 PORT=3000 DEBUG=true ENV=production
```
Expected: All provided values should be displayed correctly

### 4. Test with empty value
```bash
npm run build && node dist/index.js run examples/command-line-args.ezlang TOKEN=
```
Expected: TOKEN should be empty string "", not default

### 5. Test with special characters
```bash
npm run build && node dist/index.js run examples/command-line-args.ezlang TOKEN=abc123 URL=https://example.com:8080/path?query=1
```
Expected: URL should include all special characters

### 6. Test Discord bot example
```bash
npm run build && node dist/index.js run examples/command-line-args.ezlang DISCORD_TOKEN=my_secret_token
```
Expected: Should show "Ready to start bot with provided token"

## Automated Tests

Run the unit tests to verify the implementation logic:

```bash
npm test -- get-argument-unit.test.ts
```

This runs 13 unit tests covering:
- Default values
- Provided values
- Multiple arguments
- Empty values
- Arguments without equals signs
- Case sensitivity
- Null defaults
- Values with equals signs
- Special characters
- Duplicate keys
- Numeric values

All tests should pass.
