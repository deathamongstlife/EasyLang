---
layout: default
title: Python Packages
description: Use Python packages in EasyLang
---

# Python Packages Bridge

Access Python's vast ecosystem of packages from EasyLang.

## Setup

Python bridge requires Python 3.7+ installed:

```bash
pip install python-bridge
```

## Usage

### Import a Package

```ezlang
use_python_package("package_name")
```

### Call Python Functions

```ezlang
let result = python_call("module.function", arg1, arg2)
```

## Examples

### HTTP Requests with requests

```ezlang
use_python_package("requests")

listen("messageCreate", function(message) {
    if message.content == "!weather" {
        let response = python_call("requests.get",
            "https://api.weather.com/current")

        let data = python_call("response.json")
        reply(message, "Temperature: " + to_string(data.temp))
    }
})
```

### Data Analysis with pandas

```ezlang
use_python_package("pandas")

// Read CSV file
let df = python_call("pandas.read_csv", "data.csv")

// Get statistics
let stats = python_call("df.describe")
print(stats)
```

### Math with numpy

```ezlang
use_python_package("numpy")

// Create array
let arr = python_call("numpy.array", [1, 2, 3, 4, 5])

// Calculate mean
let mean = python_call("numpy.mean", arr)
print("Mean: " + to_string(mean))

// Matrix operations
let matrix = python_call("numpy.matrix", [[1, 2], [3, 4]])
let inverse = python_call("numpy.linalg.inv", matrix)
```

### Web Scraping with BeautifulSoup

```ezlang
use_python_package("bs4")
use_python_package("requests")

let response = python_call("requests.get", "https://example.com")
let soup = python_call("bs4.BeautifulSoup", response.text, "html.parser")

// Find all links
let links = python_call("soup.find_all", "a")
for link in links {
    print(python_call("link.get", "href"))
}
```

### Image Processing with Pillow

```ezlang
use_python_package("PIL")

// Open image
let img = python_call("PIL.Image.open", "photo.jpg")

// Resize
let resized = python_call("img.resize", [800, 600])

// Save
python_call("resized.save", "photo_resized.jpg")
```

### Machine Learning with scikit-learn

```ezlang
use_python_package("sklearn")

// Load dataset
let data = python_call("sklearn.datasets.load_iris")

// Train model
let model = python_call("sklearn.tree.DecisionTreeClassifier")
python_call("model.fit", data.data, data.target)

// Predict
let prediction = python_call("model.predict", [[5.1, 3.5, 1.4, 0.2]])
print("Prediction: " + to_string(prediction))
```

## Type Conversion

EasyLang automatically converts between types:

| EasyLang | Python |
|----------|--------|
| String | str |
| Number | int/float |
| Boolean | bool |
| Array | list |
| Object | dict |
| null | None |

## Common Packages

Popular Python packages you can use:

- **requests** - HTTP library
- **numpy** - Numerical computing
- **pandas** - Data analysis
- **beautifulsoup4** - Web scraping
- **pillow** - Image processing
- **matplotlib** - Data visualization
- **scikit-learn** - Machine learning
- **tensorflow** - Deep learning
- **flask** - Web framework

## Best Practices

1. Install packages before use:
   ```bash
   pip install package_name
   ```

2. Cache results when possible:
   ```ezlang
   let cached_data = null
   if cached_data == null {
       cached_data = python_call("expensive.operation")
   }
   ```

3. Handle errors:
   ```ezlang
   try {
       let result = python_call("module.function")
   } catch error {
       print("Python error: " + error)
   }
   ```

[← Back to Bridge System](/EasyLang/bridge-system/)
