---
layout: default
title: Built-in Functions
description: Core EasyLang built-in functions and utilities
---

# Built-in Functions

Core language functions for strings, arrays, math, and utilities.

## String Functions

### print(value)
Output value to console.

```ezlang
print("Hello, world!")
print(variable)
```

### to_string(value)
Convert value to string.

```ezlang
let num = 42
let text = to_string(num)  // "42"
```

### length(string_or_array)
Get length of string or array.

```ezlang
length("hello")      // 5
length([1, 2, 3])    // 3
```

### upper(string)
Convert to uppercase.

```ezlang
upper("hello")  // "HELLO"
```

### lower(string)
Convert to lowercase.

```ezlang
lower("HELLO")  // "hello"
```

### split(string, delimiter)
Split string into array.

```ezlang
split("a,b,c", ",")  // ["a", "b", "c"]
```

### join(array, delimiter)
Join array into string.

```ezlang
join(["a", "b", "c"], ", ")  // "a, b, c"
```

### contains(string, substring)
Check if string contains substring.

```ezlang
contains("hello world", "world")  // true
```

### starts_with(string, prefix)
Check if string starts with prefix.

```ezlang
starts_with("hello", "hel")  // true
```

### ends_with(string, suffix)
Check if string ends with suffix.

```ezlang
ends_with("hello", "lo")  // true
```

### replace(string, old, new)
Replace occurrences in string.

```ezlang
replace("hello world", "world", "there")  // "hello there"
```

### trim(string)
Remove whitespace from ends.

```ezlang
trim("  hello  ")  // "hello"
```

## Array Functions

### push(array, value)
Add element to end of array.

```ezlang
let arr = [1, 2]
push(arr, 3)  // [1, 2, 3]
```

### pop(array)
Remove and return last element.

```ezlang
let arr = [1, 2, 3]
let last = pop(arr)  // 3, arr is now [1, 2]
```

### slice(array, start, end?)
Extract portion of array.

```ezlang
let arr = [1, 2, 3, 4, 5]
slice(arr, 1, 3)  // [2, 3]
```

### reverse(array)
Reverse array order.

```ezlang
reverse([1, 2, 3])  // [3, 2, 1]
```

### sort(array)
Sort array.

```ezlang
sort([3, 1, 2])  // [1, 2, 3]
```

## Math Functions

### random()
Random number 0-1.

```ezlang
random()  // 0.742...
```

### random_int(min, max)
Random integer in range.

```ezlang
random_int(1, 6)  // Random 1-6
```

### floor(number)
Round down.

```ezlang
floor(4.7)  // 4
```

### ceil(number)
Round up.

```ezlang
ceil(4.1)  // 5
```

### round(number)
Round to nearest.

```ezlang
round(4.5)  // 5
```

### abs(number)
Absolute value.

```ezlang
abs(-5)  // 5
```

## Object Functions

### object_keys(object)
Get array of object keys.

```ezlang
let obj = {"a": 1, "b": 2}
object_keys(obj)  // ["a", "b"]
```

### has_key(object, key)
Check if key exists.

```ezlang
has_key({"a": 1}, "a")  // true
```

## Utility Functions

### now()
Current timestamp in milliseconds.

```ezlang
let time = now()
```

### sleep(milliseconds)
Pause execution.

```ezlang
sleep(1000)  // Wait 1 second
```

### get_env(variable_name)
Get environment variable.

```ezlang
let token = get_env("BOT_TOKEN")
```

### range(start, end)
Create number array.

```ezlang
range(1, 5)  // [1, 2, 3, 4, 5]
```

[← Back to API Reference](/EasyLang/api/)
