# Python Integration Quick Start

Get started with EzLang Python integration in 5 minutes!

## Prerequisites

1. Python 3.6 or later
2. Node.js 16 or later
3. EzLang installed

## Installation

### 1. Install Python Dependencies

```bash
pip install ipc
```

### 2. Build EzLang (if not already built)

```bash
cd EasyLang
npm install
npm run build
```

## Quick Test

### Run the Example

```bash
npm start run examples/python-integration.ezlang
```

You should see output like:

```
Testing Python Integration
==============================

📐 Math Module:
Pi: 3.141592653589793
Square root of 16: 4
2^8: 256
Sine of 90°: 1

🎲 Random Module:
Random integer (1-100): 42
Random float: 0.7234
Random choice from [1, 2, 3, 4, 5] : 3

📄 JSON Module:
JSON string: {"name": "EzLang", "version": "1.0.0"}

📅 DateTime Module:
Current time: 2025-01-10 12:34:56

💻 OS Module:
Current directory: /path/to/EzLang
Platform: posix

✅ Python integration test complete!
```

## Your First Python Integration

Create a file `my-python-test.ezlang`:

```ezlang
// Import Python's math module
use "math" as math

// Use Python constants
print("Pi is:", math.pi)

// Call Python functions
var result = math.sqrt(144)
print("Square root of 144 is:", result)

// Trigonometry
var angle_deg = 45
var angle_rad = math.radians(angle_deg)
var sine_value = math.sin(angle_rad)
print("Sine of 45° is:", sine_value)
```

Run it:

```bash
npm start run my-python-test.ezlang
```

## Common Use Cases

### 1. Random Numbers

```ezlang
use "random" as random

var dice = random.randint(1, 6)
print("You rolled:", dice)
```

### 2. HTTP Requests

First install requests: `pip install requests`

```ezlang
use "requests" as requests

var response = requests.get("https://api.github.com")
print("Status:", response.status_code)
```

### 3. JSON Processing

```ezlang
use "json" as json

var data = {"name": "EzLang", "version": "1.0"}
var json_str = json.dumps(data)
print(json_str)
```

### 4. File Operations

```ezlang
use "os" as os

print("Current directory:", os.getcwd())
print("Files:", os.listdir("."))
```

## Troubleshooting

### Python Not Found

**Error:** `Python not found`

**Solution:** Install Python 3.6+ and ensure it's in your PATH

```bash
python3 --version
```

### Module Not Found

**Error:** `No module named 'ipc'`

**Solution:** Install the IPC package

```bash
pip install ipc
```

### Import Error for Third-Party Package

**Error:** `No module named 'requests'`

**Solution:** Install the Python package

```bash
pip install requests
```

## Next Steps

- Read [PYTHON.md](PYTHON.md) for complete documentation
- Try [examples/python-integration.ezlang](examples/python-integration.ezlang) for more examples
- Explore Python packages you want to use!

## Available Python Packages

You can use ANY Python package! Some popular ones:

### Standard Library (Built-in)
- `math` - Mathematical functions
- `random` - Random number generation
- `json` - JSON encoding/decoding
- `datetime` - Date and time handling
- `os` - Operating system interface
- `pathlib` - Object-oriented filesystem paths
- `re` - Regular expressions
- `collections` - Container datatypes
- `itertools` - Iterator functions

### Data Science (Install Required)
- `numpy` - Numerical computing
- `pandas` - Data analysis
- `matplotlib` - Plotting and visualization
- `scipy` - Scientific computing

### Web & APIs
- `requests` - HTTP library
- `flask` - Web framework
- `beautifulsoup4` - Web scraping
- `urllib3` - HTTP client

### Machine Learning
- `scikit-learn` - ML algorithms
- `tensorflow` - Deep learning
- `pytorch` - Deep learning

Install any package with:
```bash
pip install package_name
```

## Full Documentation

For complete documentation, see:
- [PYTHON.md](PYTHON.md) - Full Python integration guide
- [README.md](README.md) - General EzLang documentation

Happy coding! 🎉
