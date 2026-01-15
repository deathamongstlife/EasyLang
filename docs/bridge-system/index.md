---
layout: default
title: Bridge System
description: Access Python and npm packages from EasyLang
---

# Bridge System

EasyLang's bridge system allows you to use thousands of Python and npm packages directly in your bots.

## Overview

The bridge system provides two-way communication between EasyLang and:
- **Python** - Access Python packages like requests, numpy, pandas
- **npm** - Access JavaScript packages like axios, moment, lodash

## Features

- Seamless package integration
- Automatic type conversion
- Full access to package APIs
- No additional setup required

## Quick Example

### Python Bridge

```ezlang
// Use Python's requests library
use_python_package("requests")

let response = python_call("requests.get", "https://api.github.com")
let data = python_call("response.json")

print(data)
```

### npm Bridge

```ezlang
// Use axios for HTTP requests
use_npm_package("axios")

let response = await npm_call("axios.get", "https://api.github.com")
print(response.data)
```

## Learn More

- [Python Packages →](/EasyLang/bridge-system/python-packages)
- [NPM Packages →](/EasyLang/bridge-system/npm-packages)

[← Back to Documentation](/EasyLang/)
