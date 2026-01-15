# EasyLang Bridge System Documentation

## Overview

EasyLang features a comprehensive, production-ready bridge system that allows seamless integration with both **Python (pip)** and **JavaScript (npm)** packages. This makes EasyLang uniquely powerful - you can leverage the vast ecosystems of both Python and Node.js in your Discord bot projects.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Python Bridge](#python-bridge)
- [JavaScript/npm Bridge](#javascriptnpm-bridge)
- [Advanced Usage](#advanced-usage)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Features

### Python Bridge
- ✅ Import any pip package
- ✅ Auto-install missing packages
- ✅ Call functions with complex arguments
- ✅ Access properties and methods
- ✅ Handle async Python code
- ✅ Class instantiation
- ✅ Comprehensive error handling
- ✅ Type conversion (Python ↔ JavaScript)
- ✅ Support for datetime, bytes, sets, and custom objects

### JavaScript/npm Bridge
- ✅ Import any npm package dynamically
- ✅ Auto-install missing packages
- ✅ Call functions and methods
- ✅ Access properties
- ✅ Handle promises and async/await
- ✅ Class instantiation with 'new'
- ✅ Event emitter support
- ✅ Stream handling
- ✅ Full error handling

### Common Features
- ✅ Auto-detect package type (Python vs npm)
- ✅ Package caching for performance
- ✅ Concurrent package management
- ✅ Version management
- ✅ Dependency resolution
- ✅ Clear error messages

## Installation

### Prerequisites

**Python Bridge:**
```bash
# Python 3.6+ required
python3 --version

# Install required IPC library
pip3 install ipc
```

**JavaScript Bridge:**
```bash
# Node.js 16+ required (included with EasyLang)
node --version
```

### Installing EasyLang

```bash
# Clone repository
git clone https://github.com/yourrepo/EasyLang.git
cd EasyLang

# Install dependencies
npm install

# Build
npm run build
```

## Quick Start

### Basic Python Package Usage

```ezlang
# Import Python package (auto-detect)
use "requests" as requests

# Make HTTP request
var response = requests.get("https://api.github.com")
print(response.status_code)
```

### Basic npm Package Usage

```ezlang
# Import npm package (auto-detect)
use "axios" as axios

# Make HTTP request
var response = axios.get("https://api.github.com")
print(response.data)
```

### Explicit Type Specification

```ezlang
# Explicit Python
use python "numpy" as np
var arr = np.array([1, 2, 3, 4, 5])
print(arr)

# Explicit npm
use npm "lodash" as _
var sorted = _.sortBy([3, 1, 4, 1, 5])
print(sorted)
```

## API Reference

### `use(package)` or `use(type, package)`

Universal package import function.

**Syntax:**
```ezlang
# Auto-detect type
use "package_name" as alias

# Explicit type
use python "package_name" as alias
use npm "package_name" as alias
```

**Parameters:**
- `type` (optional): "python" or "npm"
- `package_name`: Name of the package to import
- `alias`: Variable name to use in your code

**Returns:** Package object with all exports

**Example:**
```ezlang
use "requests" as req
use python "pandas" as pd
use npm "moment" as moment
```

### `require(package)`

Import npm package (JavaScript-style).

**Syntax:**
```ezlang
require("package_name") as alias
```

**Parameters:**
- `package_name`: npm package name

**Returns:** Package object

**Example:**
```ezlang
require("express") as express
require("lodash") as _
```

### `import_python(module)`

Import Python module explicitly.

**Syntax:**
```ezlang
import_python("module_name") as alias
```

**Parameters:**
- `module_name`: Python module/package name

**Returns:** Module object

**Example:**
```ezlang
import_python("math") as math
import_python("datetime") as dt
```

## Python Bridge

### Supported Features

#### 1. Function Calls

```ezlang
use python "math" as math

var result = math.sqrt(16)
print(result)  # 4.0

var pi = math.pi
print(pi)  # 3.141592653589793
```

#### 2. Class Instantiation

```ezlang
use python "datetime" as dt

# Create datetime object
var now = dt.datetime.now()
print(now.isoformat())

# Create custom instance
var date = dt.date(2024, 1, 15)
print(date)
```

#### 3. Async Functions

```ezlang
use python "asyncio" as asyncio

# Async functions are automatically handled
var result = asyncio.sleep(1)
```

#### 4. Complex Data Types

```ezlang
use python "numpy" as np

# Arrays
var arr = np.array([1, 2, 3, 4, 5])
print(arr)

# Matrices
var matrix = np.array([[1, 2], [3, 4]])
var det = np.linalg.det(matrix)
print(det)
```

#### 5. Auto-Installation

```ezlang
# Package will be auto-installed if missing
use python "requests" as requests

# EasyLang automatically runs: pip install requests
```

### Python Type Conversion

| Python Type | EasyLang Type | Notes |
|------------|---------------|-------|
| `None` | `null` | Direct conversion |
| `int`, `float` | `number` | Direct conversion |
| `str` | `string` | Direct conversion |
| `bool` | `boolean` | Direct conversion |
| `list`, `tuple` | `array` | Recursively converted |
| `dict` | `object` | Recursively converted |
| `bytes` | `array` | Converted to array of numbers |
| `datetime` | `string` | ISO format string |
| `set` | `array` | Converted to array |
| `function` | `function` | Callable proxy |
| `class` | `function` | Constructor proxy |

## JavaScript/npm Bridge

### Supported Features

#### 1. Function Calls

```ezlang
use npm "lodash" as _

var result = _.chunk([1, 2, 3, 4, 5], 2)
print(result)  # [[1, 2], [3, 4], [5]]
```

#### 2. Promises and Async/Await

```ezlang
use npm "axios" as axios

# Promises are automatically awaited
var response = axios.get("https://api.example.com")
print(response.data)
```

#### 3. Class Instantiation

```ezlang
use npm "moment" as moment

# Create moment instance
var now = moment()
print(now.format("LLLL"))
```

#### 4. Event Emitters

```ezlang
use npm "events" as events

var emitter = events.EventEmitter()

# Register event listener
emitter.on("data", function(data) {
  print("Received:", data)
})

# Emit event
emitter.emit("data", "Hello!")
```

#### 5. Object Methods

```ezlang
use npm "moment" as moment

var date = moment()
var formatted = date.format("YYYY-MM-DD")
var next_week = date.add(7, "days")
print(next_week.format("LL"))
```

### JavaScript Type Conversion

| JavaScript Type | EasyLang Type | Notes |
|----------------|---------------|-------|
| `null`, `undefined` | `null` | Both convert to null |
| `number` | `number` | Direct conversion |
| `string` | `string` | Direct conversion |
| `boolean` | `boolean` | Direct conversion |
| `Array` | `array` | Recursively converted |
| `Object` | `object` | Recursively converted |
| `Function` | `function` | Callable proxy |
| `Promise` | `function` | Async function |
| `Date` | `string` | ISO format |
| `Buffer` | `array` | Array of bytes |
| `RegExp` | `string` | Pattern as string |
| `Set` | `array` | Converted to array |
| `Map` | `object` | Converted to object |

## Advanced Usage

### Mixed Python and JavaScript

```ezlang
# Use both ecosystems together
use python "numpy" as np
use npm "lodash" as _

# Generate data with Python
var numbers = []
for var i = 0; i < 10; i = i + 1 {
  push(numbers, i * i)
}

# Process with lodash
var sorted = _.sortBy(numbers)
var chunked = _.chunk(sorted, 3)

# Calculate statistics with numpy
var arr = np.array(numbers)
var mean = np.mean(arr)
var std = np.std(arr)

print("Mean:", mean)
print("Std Dev:", std)
```

### Package Management

```ezlang
# Packages are automatically installed on first use
use "requests" as req  # Auto-installs if missing

# Force specific version (in package.json or requirements.txt)
# Then run: npm install package@version
# Or: pip install package==version
```

### Error Handling

```ezlang
# Errors are automatically propagated
try {
  use python "nonexistent_package" as pkg
} catch {
  print("Package not found!")
}
```

### Performance Optimization

```ezlang
# Packages are cached after first import
use "lodash" as _  # First import: loads package
# ... later in code ...
use "lodash" as _  # Instant: uses cache
```

## Examples

### Example 1: Data Analysis

```ezlang
use python "pandas" as pd
use npm "lodash" as _

# Read CSV with pandas
var df = pd.read_csv("data.csv")
print("Rows:", df.shape[0])

# Process with lodash
var values = df.values.tolist()
var sorted = _.sortBy(values, 0)
print("Sorted:", sorted)
```

### Example 2: Web Scraping

```ezlang
use python "requests" as requests
use python "beautifulsoup4" as bs4

# Fetch web page
var response = requests.get("https://example.com")
var soup = bs4.BeautifulSoup(response.text, "html.parser")

# Extract title
var title = soup.find("title")
print("Page title:", title.text)
```

### Example 3: Date/Time Operations

```ezlang
use npm "moment" as moment
use python "datetime" as dt

# JavaScript date manipulation
var now = moment()
print("Now:", now.format("LLLL"))

# Python datetime
var py_now = dt.datetime.now()
print("Python now:", py_now.isoformat())
```

### Example 4: HTTP Clients

```ezlang
use python "requests" as requests
use npm "axios" as axios

# Python requests
var py_response = requests.get("https://api.github.com")
print("Python status:", py_response.status_code)

# JavaScript axios
var js_response = axios.get("https://api.github.com")
print("JavaScript status:", js_response.status)
```

## Troubleshooting

### Python Bridge Issues

**Problem:** `Python bridge not available`

**Solution:**
```bash
# Check Python installation
python3 --version

# Install IPC library
pip3 install ipc
# Or with --user flag
pip3 install --user ipc
```

**Problem:** `Module not found`

**Solution:**
```bash
# Manually install the package
pip3 install package_name

# Or let EasyLang auto-install (if enabled)
```

**Problem:** `externally-managed-environment error`

**Solution:**
```bash
# Use --user flag
pip3 install --user package_name

# Or use virtual environment
python3 -m venv venv
source venv/bin/activate
pip install package_name
```

### JavaScript Bridge Issues

**Problem:** `Package not found in node_modules`

**Solution:**
```bash
# Install manually
npm install package_name
# Or
bun add package_name
```

**Problem:** `Cannot find module`

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
```

**Problem:** `Module version mismatch`

**Solution:**
```bash
# Update specific package
npm update package_name

# Or install specific version
npm install package_name@version
```

### General Issues

**Problem:** `Package type auto-detection fails`

**Solution:**
```ezlang
# Use explicit type
use python "package" as pkg
# Or
use npm "package" as pkg
```

**Problem:** `Performance issues`

**Solution:**
- Packages are cached automatically
- Restart EasyLang to clear cache
- Check system resources

## Best Practices

1. **Use explicit types** for clarity in production code
2. **Handle errors** when importing optional packages
3. **Cache package references** in variables for repeated use
4. **Check package availability** before using in production
5. **Version lock** important packages in package.json/requirements.txt
6. **Document dependencies** in your project README

## Performance Tips

- Packages are cached after first import
- IPC communication is optimized
- Type conversion is minimized
- Object references reduce data transfer

## Security Considerations

- Only import trusted packages
- Review package code before production use
- Keep packages updated for security patches
- Use virtual environments for Python

## Further Reading

- [Python Package Index (PyPI)](https://pypi.org/)
- [npm Registry](https://www.npmjs.com/)
- [EasyLang Examples](../examples/bridges/)
- [API Documentation](./API.md)

## Support

For issues, questions, or contributions:
- GitHub Issues: [Link]
- Documentation: [Link]
- Discord: [Link]
