# Python Integration

EzLang provides seamless integration with Python packages, allowing you to use any Python library directly in your EzLang code.

## Overview

The Python bridge enables EzLang to:
- Import and use Python modules
- Call Python functions with EzLang values
- Access Python constants and attributes
- Automatically convert between EzLang and Python data types

## Requirements

- Python 3.6 or later
- `ipc` Python package (installed via `pip install ipc`)

## Installation

1. Install Python 3.6 or later
2. Install the required Python package:
   ```bash
   pip install ipc
   ```

3. The Python bridge will automatically start when you use Python modules in your code.

## Basic Usage

### Importing Python Modules

Use the `use` statement to import Python modules:

```ezlang
use "math" as math
use "random" as random
use "requests" as requests
```

The syntax is: `use "module_name" as alias`

### Accessing Module Attributes

Access constants, variables, and functions using dot notation:

```ezlang
use "math" as math

// Access constants
var pi = math.pi
var e = math.e

print("Pi:", pi)
print("E:", e)
```

### Calling Python Functions

Call Python functions just like EzLang functions:

```ezlang
use "math" as math

var result = math.sqrt(16)
print("Square root of 16:", result)

var power = math.pow(2, 8)
print("2^8:", power)
```

### Working with Multiple Arguments

Python functions accept multiple arguments:

```ezlang
use "random" as random

var rand_int = random.randint(1, 100)
print("Random number (1-100):", rand_int)
```

## Data Type Conversion

EzLang automatically converts between data types:

### EzLang to Python
- `number` → `int` or `float`
- `string` → `str`
- `boolean` → `bool`
- `null` → `None`
- `array` → `list`
- `object` → `dict`

### Python to EzLang
- `int`, `float` → `number`
- `str` → `string`
- `bool` → `boolean`
- `None` → `null`
- `list`, `tuple` → `array`
- `dict` → `object`
- Functions → `native-function`

## Common Use Cases

### Math Operations

```ezlang
use "math" as math

// Trigonometry
var angle = 45
var radians = math.radians(angle)
var sine = math.sin(radians)
var cosine = math.cos(radians)

print("Sine of 45°:", sine)
print("Cosine of 45°:", cosine)

// Logarithms
var log_result = math.log(100)
print("Natural log of 100:", log_result)
```

### Random Number Generation

```ezlang
use "random" as random

// Random integer
var dice_roll = random.randint(1, 6)
print("Dice roll:", dice_roll)

// Random float
var probability = random.random()
print("Random probability:", probability)

// Random choice from array
var colors = ["red", "green", "blue", "yellow"]
var picked = random.choice(colors)
print("Picked color:", picked)
```

### JSON Processing

```ezlang
use "json" as json

// Serialize data to JSON
var user = {
  "name": "Alice",
  "age": 30,
  "active": true
}

var json_string = json.dumps(user)
print("JSON:", json_string)

// Parse JSON string
var parsed = json.loads(json_string)
print("Parsed name:", parsed.name)
```

### HTTP Requests

```ezlang
use "requests" as requests

// Make HTTP GET request
var response = requests.get("https://api.github.com")
var data = response.json()

print("Status:", response.status_code)
print("GitHub API response:", data)
```

### Date and Time

```ezlang
use "datetime" as datetime

// Get current datetime
var now = datetime.datetime.now()
print("Current time:", now)

// Create specific date
var birthday = datetime.date(1990, 5, 15)
print("Birthday:", birthday)
```

### File System Operations

```ezlang
use "os" as os
use "pathlib" as pathlib

// Get current directory
var cwd = os.getcwd()
print("Current directory:", cwd)

// Check platform
print("Platform:", os.name)

// List directory contents
var files = os.listdir(".")
print("Files:", files)
```

## Advanced Examples

### Data Science with NumPy

```ezlang
use "numpy" as np

// Create array
var arr = np.array([1, 2, 3, 4, 5])
print("Array:", arr)

// Statistical operations
var mean = np.mean(arr)
var std = np.std(arr)

print("Mean:", mean)
print("Standard deviation:", std)
```

### Web Scraping with BeautifulSoup

```ezlang
use "requests" as requests
use "bs4" as bs4

// Fetch webpage
var response = requests.get("https://example.com")
var soup = bs4.BeautifulSoup(response.text, "html.parser")

// Extract title
var title = soup.find("title")
print("Page title:", title.text)
```

### Data Processing with Pandas

```ezlang
use "pandas" as pd

// Create DataFrame
var data = {
  "name": ["Alice", "Bob", "Charlie"],
  "age": [25, 30, 35],
  "city": ["NYC", "LA", "Chicago"]
}

var df = pd.DataFrame(data)
print("DataFrame:", df)

// Get summary statistics
var stats = df.describe()
print("Statistics:", stats)
```

## Error Handling

If a Python module is not available or an error occurs, EzLang will throw a runtime error:

```ezlang
// This will fail if requests is not installed
use "requests" as requests

// Handle potential errors in your code
var response = requests.get("https://invalid-url")
// Runtime error will be thrown if request fails
```

## Troubleshooting

### Python Not Found

**Error:** `Python bridge not available: Python not found`

**Solution:** Install Python 3.6 or later and ensure it's in your system PATH.

### Module Not Found

**Error:** `Failed to import Python module 'xyz': No module named 'xyz'`

**Solution:** Install the Python package using pip:
```bash
pip install xyz
```

### IPC Package Missing

**Error:** `Failed to import Python module 'ipc'`

**Solution:** Install the ipc package:
```bash
pip install ipc
```

### Connection Timeout

**Error:** `Connection timeout: Python bridge did not respond`

**Solution:**
- Check if Python is installed correctly
- Ensure the `bridge.py` script exists in `python-runtime/`
- Check for port conflicts

## Limitations

1. **Subprocess Communication:** Python runs in a separate process, so there's a small overhead for each call.

2. **Complex Objects:** Some Python objects cannot be serialized and will be returned as string representations.

3. **Callbacks:** Python callbacks into EzLang code are not supported.

4. **Module Caching:** Imported modules are cached for the lifetime of the program.

## Performance Tips

1. **Batch Operations:** When possible, do multiple operations in Python rather than making many small calls.

2. **Cache Results:** Store frequently accessed values in EzLang variables:
   ```ezlang
   use "math" as math
   var pi = math.pi  // Store for reuse
   ```

3. **Use Native Functions:** For simple operations, use EzLang's built-in functions instead of Python.

## Architecture

The Python bridge uses IPC (Inter-Process Communication) to connect EzLang and Python:

```
┌─────────────┐         IPC          ┌──────────────┐
│   EzLang    │ ◄───────────────────► │    Python    │
│   Runtime   │   (node-ipc/socket)  │    Bridge    │
└─────────────┘                       └──────────────┘
       │                                     │
       │                                     │
       ▼                                     ▼
  TypeScript                            Python 3.6+
  Node.js                              importlib
```

### Components

1. **Python Bridge (`python-runtime/bridge.py`):**
   - Starts IPC server
   - Imports Python modules
   - Handles function calls
   - Serializes results

2. **IPC Client (`src/python/ipc.ts`):**
   - Connects to Python bridge
   - Sends requests
   - Receives responses

3. **Bridge Manager (`src/python/index.ts`):**
   - Spawns Python process
   - Manages module imports
   - Coordinates function calls

4. **Python Proxy (`src/python/proxy.ts`):**
   - Creates EzLang objects for Python modules
   - Converts data types
   - Handles member access

## Contributing

To add support for new Python features:

1. Update `bridge.py` to handle new operations
2. Add corresponding TypeScript methods
3. Update documentation
4. Add tests

## Examples

See `examples/python-integration.ezlang` for a comprehensive example of Python integration features.

## License

The Python bridge is part of EzLang and is released under the MIT License.
