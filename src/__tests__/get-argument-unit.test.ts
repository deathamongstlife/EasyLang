/**
 * Unit tests for get_argument() implementation logic
 * Tests the function logic without full runtime integration
 */

describe('get_argument() logic', () => {
  // Save original argv
  const originalArgv = process.argv;

  afterEach(() => {
    // Restore original argv after each test
    process.argv = originalArgv;
  });

  // Simulate the get_argument function logic
  function get_argument_impl(key: string, defaultValue: string | null = null): string | null {
    // Search through process.argv for KEY=VALUE arguments
    // Skip the first two args (node executable and script path)
    for (let i = 2; i < process.argv.length; i++) {
      const arg = process.argv[i];

      // Check if argument contains '='
      const equalIndex = arg.indexOf('=');
      if (equalIndex === -1) {
        continue; // Skip arguments without '='
      }

      // Split into key and value
      const argKey = arg.substring(0, equalIndex);
      const argValue = arg.substring(equalIndex + 1);

      // Match the key (case-sensitive)
      if (argKey === key) {
        // Return the value, even if it's empty
        return argValue;
      }
    }

    // Key not found, return default value
    return defaultValue;
  }

  test('should return default value when argument not provided', () => {
    process.argv = ['node', 'test.js'];
    const result = get_argument_impl('DISCORD_TOKEN', 'default_token');
    expect(result).toBe('default_token');
  });

  test('should return provided value when argument exists', () => {
    process.argv = ['node', 'test.js', 'DISCORD_TOKEN=abc123'];
    const result = get_argument_impl('DISCORD_TOKEN', 'default_token');
    expect(result).toBe('abc123');
  });

  test('should handle multiple arguments', () => {
    process.argv = ['node', 'test.js', 'DISCORD_TOKEN=mytoken', 'PORT=3000'];

    const token = get_argument_impl('DISCORD_TOKEN', 'default_token');
    const port = get_argument_impl('PORT', '8080');
    const host = get_argument_impl('HOST', 'localhost');

    expect(token).toBe('mytoken');
    expect(port).toBe('3000');
    expect(host).toBe('localhost'); // Not provided, uses default
  });

  test('should handle empty value', () => {
    process.argv = ['node', 'test.js', 'EMPTY_KEY='];
    const result = get_argument_impl('EMPTY_KEY', 'default');
    expect(result).toBe(''); // Empty string, not default
  });

  test('should skip arguments without equals sign', () => {
    process.argv = ['node', 'test.js', 'someArg', 'TOKEN=found', 'anotherArg'];
    const result = get_argument_impl('TOKEN', 'default');
    expect(result).toBe('found');
  });

  test('should be case-sensitive for keys', () => {
    process.argv = ['node', 'test.js', 'token=lowercase'];

    const lower = get_argument_impl('token', 'default_lower');
    const upper = get_argument_impl('TOKEN', 'default_upper');

    expect(lower).toBe('lowercase');
    expect(upper).toBe('default_upper'); // Different case, not found
  });

  test('should return null when no default provided and key not found', () => {
    process.argv = ['node', 'test.js'];
    const result = get_argument_impl('MISSING_KEY');
    expect(result).toBe(null);
  });

  test('should handle values containing equals signs', () => {
    process.argv = ['node', 'test.js', 'CONFIG=key=value'];
    const result = get_argument_impl('CONFIG', 'default');
    expect(result).toBe('key=value'); // Value after first =
  });

  test('should handle special characters in values', () => {
    process.argv = ['node', 'test.js', 'URL=https://example.com:8080/path?query=1'];
    const result = get_argument_impl('URL', 'default');
    expect(result).toBe('https://example.com:8080/path?query=1');
  });

  test('should handle values with spaces (if quoted by shell)', () => {
    // In shell: KEY="value with spaces" becomes process.argv entry: "KEY=value with spaces"
    process.argv = ['node', 'test.js', 'MESSAGE=hello world'];
    const result = get_argument_impl('MESSAGE', 'default');
    expect(result).toBe('hello world');
  });

  test('should return first matching key if duplicates exist', () => {
    process.argv = ['node', 'test.js', 'KEY=first', 'KEY=second'];
    const result = get_argument_impl('KEY', 'default');
    expect(result).toBe('first'); // Returns first match
  });

  test('should handle key at position 0 (if = in key)', () => {
    process.argv = ['node', 'test.js', '=value'];
    const result = get_argument_impl('', 'default');
    expect(result).toBe('value'); // Empty key matches
  });

  test('should handle numeric-like values', () => {
    process.argv = ['node', 'test.js', 'PORT=3000', 'COUNT=42'];
    const port = get_argument_impl('PORT', '8080');
    const count = get_argument_impl('COUNT', '0');

    expect(port).toBe('3000'); // Still strings
    expect(count).toBe('42');
  });
});
