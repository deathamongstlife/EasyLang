# Python Bridge - Quick Start Guide

## Installation

### 1. Install Python Dependencies

```bash
# Option 1: With virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install ipc

# Option 2: System-wide (if permitted)
pip3 install ipc --break-system-packages

# Option 3: For requests library (optional)
pip3 install requests --break-system-packages
```

### 2. Build EasyLang

```bash
npm run build
```

### 3. Test the Bridge

```bash
npm run test:python
```

## Basic Usage

### Example 1: Using Python's math module

```ezlang
// Import the math module
use "math" as math

// Access constants
var pi = math.pi
var e = math.e

print("Pi:", pi)
print("E:", e)

// Call functions
var sqrt_result = math.sqrt(144)
var factorial_result = math.factorial(5)

print("Square root of 144:", sqrt_result)
print("Factorial of 5:", factorial_result)
```

### Example 2: Using Python's random module

```ezlang
// Import random module
use "random" as random

// Generate random numbers
var rand_num = random.randint(1, 100)
var rand_float = random.random()

print("Random integer (1-100):", rand_num)
print("Random float (0-1):", rand_float)

// Shuffle a list
var my_list = [1, 2, 3, 4, 5]
random.shuffle(my_list)
print("Shuffled list:", my_list)
```

### Example 3: Using Python's datetime module

```ezlang
// Import datetime
use "datetime" as datetime

// Get current date and time
var now = datetime.now()
print("Current date/time:", now)

// Get current date
var today = datetime.today()
print("Today:", today)
```

### Example 4: Using Python's requests library (if installed)

```ezlang
// Import requests
use "requests" as requests

// Make HTTP GET request
var response = requests.get("https://api.github.com/zen")
print("GitHub Zen:", response.text)

// Make HTTP POST request
var data = {"key": "value"}
var post_response = requests.post("https://httpbin.org/post", data)
print("POST response status:", post_response.status_code)
```

## Discord Bot Usage

### Test Commands

Once your Discord bot is running, try these commands:

```
!testpython
```
Tests the Python math module and displays results in an embed.

```
!testrequests
```
Tests the Python requests library and displays HTTP request results.

## Troubleshooting

### Error: "Python bridge not available"

**Solution:** Python is not installed or not in PATH
```bash
# Check Python installation
python3 --version

# If not installed, install Python 3.6+
```

### Error: "Module 'ipc' not found"

**Solution:** IPC package not installed
```bash
pip3 install ipc --break-system-packages
```

### Error: "Module 'requests' not found"

**Solution:** Requests library not installed
```bash
pip3 install requests --break-system-packages
```

### Error: "Python bridge startup timeout"

**Solutions:**
1. Check that bridge.py exists in `python-runtime/bridge.py`
2. Ensure Python has permission to execute
3. Check firewall settings for local IPC communication

### Bridge not initializing

**Debug steps:**
```bash
# Test Python bridge directly
npm run test:python

# Check Python can import IPC
python3 -c "import ipc; print('IPC OK')"

# Check bridge script exists
ls -la python-runtime/bridge.py
```

## Available Python Modules

### Built-in Modules (No Installation Required)

- `math` - Mathematical functions
- `random` - Random number generation
- `datetime` - Date and time handling
- `os` - Operating system interface
- `sys` - System-specific parameters
- `json` - JSON encoding/decoding
- `re` - Regular expressions
- `collections` - Container data types
- `itertools` - Iterator functions
- `functools` - Higher-order functions

### Popular Third-Party Modules (Require Installation)

- `requests` - HTTP library (`pip install requests`)
- `numpy` - Numerical computing (`pip install numpy`)
- `pandas` - Data analysis (`pip install pandas`)
- `beautifulsoup4` - Web scraping (`pip install beautifulsoup4`)
- `pillow` - Image processing (`pip install pillow`)

## Best Practices

### 1. Import Once, Use Many Times

```ezlang
// ✅ Good
use "math" as math

var a = math.sqrt(16)
var b = math.sqrt(25)
var c = math.sqrt(36)

// ❌ Bad (don't import multiple times)
use "math" as math1
use "math" as math2
```

### 2. Handle Errors

```ezlang
use "math" as math

// This will work
var valid = math.sqrt(16)
print("Valid:", valid)

// This might fail - handle errors in production code
try {
  var invalid = math.sqrt(-1)  // Returns complex number in Python
} catch (error) {
  print("Error:", error)
}
```

### 3. Use Meaningful Aliases

```ezlang
// ✅ Good - clear and descriptive
use "datetime" as dt
use "random" as rand

// ❌ Bad - unclear
use "datetime" as x
use "random" as r
```

### 4. Check Module Availability

```ezlang
// For optional modules, provide fallback
use "requests" as requests

if (requests) {
  var response = requests.get("https://api.example.com")
  print(response.text)
} else {
  print("Requests module not available")
}
```

## Performance Tips

1. **Import modules once** - Module imports are cached, but it's still best to import at the top
2. **Minimize IPC calls** - Each Python function call has overhead
3. **Batch operations** - If possible, do multiple operations in one Python function call
4. **Use native EasyLang** - For simple operations, native EasyLang may be faster

## Examples in the Repository

Check the `examples/` directory for complete example bots:

- `examples/package-integration-bot.ez` - Demonstrates JavaScript and Python package integration
- More examples coming soon!

## API Reference

### PythonBridge Methods (Internal Use)

These are used internally by the runtime:

```typescript
// Import a Python module
await pythonBridge.importModule(moduleName: string)

// Call a Python function
await pythonBridge.callFunction(module: string, func: string, args: any[])

// Get a Python attribute
await pythonBridge.getAttribute(module: string, path: string[])

// Check if bridge is initialized
pythonBridge.isInitialized(): boolean

// Cleanup
await pythonBridge.cleanup()
```

## Common Patterns

### Pattern 1: Math Operations

```ezlang
use "math" as math

function calculate_circle(radius) {
  var area = math.pi * radius * radius
  var circumference = 2 * math.pi * radius

  return {
    "area": area,
    "circumference": circumference
  }
}

var result = calculate_circle(5)
print("Circle with radius 5:", result)
```

### Pattern 2: Random Selection

```ezlang
use "random" as random

function pick_winner(participants) {
  var winner = random.choice(participants)
  return winner
}

var users = ["Alice", "Bob", "Charlie", "Diana"]
var winner = pick_winner(users)
print("Winner:", winner)
```

### Pattern 3: Date Formatting

```ezlang
use "datetime" as datetime

function get_formatted_date() {
  var now = datetime.now()
  var formatted = now.strftime("%Y-%m-%d %H:%M:%S")
  return formatted
}

print("Current time:", get_formatted_date())
```

## Support

For issues or questions:
1. Check this guide and PYTHON-BRIDGE-COMPLETION.md
2. Run `npm run test:python` to verify setup
3. Check the implementation in `src/python/` directory
4. Review example bots in `examples/` directory

---

**Happy coding with Python and EasyLang!** 🐍✨
