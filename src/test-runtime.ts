/**
 * Test file for EzLang Runtime
 * Tests all major features of Phase 2
 */

import { Lexer } from './lexer';
import { Parser } from './parser';
import { Runtime } from './runtime';
import { logger, LogLevel } from './utils/logger';

/**
 * Test helper to run EzLang code
 */
async function runCode(code: string, testName: string): Promise<void> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST: ${testName}`);
  console.log(`${'='.repeat(60)}`);
  console.log('Code:');
  console.log(code);
  console.log('\nOutput:');

  try {
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();

    const parser = new Parser(tokens);
    const ast = parser.parse();

    const runtime = new Runtime(ast);
    await runtime.execute();
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Run all tests
 */
async function runAllTests(): Promise<void> {
  logger.setLevel(LogLevel.ERROR); // Reduce log noise for tests

  // Test 1: Variables and arithmetic
  await runCode(
    `
var x = 10
var y = 20
var sum = x + y
print("Sum:", sum)
`,
    'Variables and Arithmetic'
  );

  // Test 2: Functions
  await runCode(
    `
function add(a, b) {
    return a + b
}
print("Result:", add(5, 3))
`,
    'Functions'
  );

  // Test 3: While loop
  await runCode(
    `
var count = 0
while count < 5 {
    print("Count:", count)
    count = count + 1
}
`,
    'While Loop'
  );

  // Test 4: For loop with range
  await runCode(
    `
for i in range(5) {
    print("Index:", i)
}
`,
    'For Loop with Range'
  );

  // Test 5: If/else
  await runCode(
    `
var age = 25
if age >= 18 {
    print("Adult")
} else {
    print("Minor")
}

var score = 85
if score >= 90 {
    print("Grade: A")
} else {
    if score >= 80 {
        print("Grade: B")
    } else {
        print("Grade: C")
    }
}
`,
    'If/Else Statements'
  );

  // Test 6: Arrays
  await runCode(
    `
var items = [1, 2, 3, 4, 5]
print("Array:", items)
print("Length:", length(items))
print("First item:", items[0])
print("Last item:", items[4])

for item in items {
    print("Item:", item)
}
`,
    'Arrays'
  );

  // Test 7: String operations
  await runCode(
    `
var firstName = "John"
var lastName = "Doe"
var fullName = firstName + " " + lastName
print("Full name:", fullName)
print("Length:", length(fullName))
`,
    'String Operations'
  );

  // Test 8: Boolean logic
  await runCode(
    `
var isAdult = true
var hasLicense = false

if isAdult && hasLicense {
    print("Can drive")
} else {
    print("Cannot drive")
}

if isAdult || hasLicense {
    print("At least one condition is true")
}
`,
    'Boolean Logic'
  );

  // Test 9: Nested functions and closures
  await runCode(
    `
function makeCounter() {
    var count = 0

    function increment() {
        count = count + 1
        return count
    }

    return increment
}

var counter = makeCounter()
print("Counter:", counter())
print("Counter:", counter())
print("Counter:", counter())
`,
    'Nested Functions and Closures'
  );

  // Test 10: Factorial (recursive function)
  await runCode(
    `
function factorial(n) {
    if n <= 1 {
        return 1
    } else {
        return n * factorial(n - 1)
    }
}

print("Factorial of 5:", factorial(5))
print("Factorial of 10:", factorial(10))
`,
    'Recursive Functions (Factorial)'
  );

  // Test 11: Array manipulation
  await runCode(
    `
var numbers = [1, 2, 3]
print("Original:", numbers)

push(numbers, 4)
push(numbers, 5)
print("After push:", numbers)

var last = pop(numbers)
print("Popped:", last)
print("After pop:", numbers)
`,
    'Array Manipulation'
  );

  // Test 12: Complex expressions
  await runCode(
    `
var a = 5
var b = 3
var c = 2

var result = (a + b) * c
print("(5 + 3) * 2 =", result)

var result2 = a * b + c
print("5 * 3 + 2 =", result2)

var result3 = a > b && b > c
print("5 > 3 && 3 > 2 =", result3)
`,
    'Complex Expressions'
  );

  // Test 13: Unary operators
  await runCode(
    `
var x = 10
var y = -x
print("Negation: -10 =", y)

var isTrue = true
var isFalse = !isTrue
print("Not true:", isFalse)
`,
    'Unary Operators'
  );

  // Test 14: Type checking and conversion
  await runCode(
    `
var number = 42
var text = "Hello"
var flag = true

print("Type of 42:", type(number))
print("Type of 'Hello':", type(text))
print("Type of true:", type(flag))

var numStr = str(number)
print("Number to string:", numStr)
`,
    'Type Operations'
  );

  // Test 15: Random numbers
  await runCode(
    `
print("Random 0-1:", random())
print("Random 1-10:", random(1, 10))
print("Random 1-10:", random(1, 10))
print("Random 1-10:", random(1, 10))
`,
    'Random Numbers'
  );

  // Test 16: FizzBuzz
  await runCode(
    `
function fizzBuzz(n) {
    for i in range(1, n + 1) {
        var output = ""

        if i % 3 == 0 {
            output = "Fizz"
        }

        if i % 5 == 0 {
            output = output + "Buzz"
        }

        if output == "" {
            output = str(i)
        }

        print(output)
    }
}

print("FizzBuzz from 1 to 15:")
fizzBuzz(15)
`,
    'FizzBuzz'
  );

  console.log(`\n${'='.repeat(60)}`);
  console.log('ALL TESTS COMPLETED');
  console.log(`${'='.repeat(60)}\n`);
}

// Run all tests
runAllTests().catch(console.error);
