/**
 * Test file for the Lexer and Parser
 */

import { Lexer } from './lexer';
import { Parser } from './parser';
import { logger, LogLevel } from './utils/logger';

// Set log level to debug to see detailed output
logger.setLevel(LogLevel.DEBUG);

// Test 1: Basic variable declaration
console.log('\n=== Test 1: Variable Declaration ===');
const test1 = `
var name = "Alice"
var age = 25
var items = [1, 2, 3]
`;

try {
  const lexer1 = new Lexer(test1);
  const tokens1 = lexer1.tokenize();
  console.log('Tokens:', tokens1.slice(0, 10).map(t => t.toString()));

  const parser1 = new Parser(tokens1);
  const ast1 = parser1.parse();
  console.log('AST:', JSON.stringify(ast1, null, 2));
} catch (error) {
  console.error('Error:', error);
}

// Test 2: Control flow
console.log('\n=== Test 2: Control Flow ===');
const test2 = `
if age >= 18 {
    print("Adult")
} else {
    print("Minor")
}
`;

try {
  const lexer2 = new Lexer(test2);
  const tokens2 = lexer2.tokenize();

  const parser2 = new Parser(tokens2);
  const ast2 = parser2.parse();
  console.log('AST:', JSON.stringify(ast2, null, 2));
} catch (error) {
  console.error('Error:', error);
}

// Test 3: Function declaration
console.log('\n=== Test 3: Function Declaration ===');
const test3 = `
function greet(name) {
    return "Hello, " + name
}
`;

try {
  const lexer3 = new Lexer(test3);
  const tokens3 = lexer3.tokenize();

  const parser3 = new Parser(tokens3);
  const ast3 = parser3.parse();
  console.log('AST:', JSON.stringify(ast3, null, 2));
} catch (error) {
  console.error('Error:', error);
}

// Test 4: Discord commands
console.log('\n=== Test 4: Discord Commands ===');
const test4 = `
listen "messageCreate" (msg) {
    if msg.content == "!ping" {
        reply msg "Pong!"
    }
}
`;

try {
  const lexer4 = new Lexer(test4);
  const tokens4 = lexer4.tokenize();

  const parser4 = new Parser(tokens4);
  const ast4 = parser4.parse();
  console.log('AST:', JSON.stringify(ast4, null, 2));
} catch (error) {
  console.error('Error:', error);
}

// Test 5: For loop
console.log('\n=== Test 5: For Loop ===');
const test5 = `
for i in range(5) {
    print(i)
}
`;

try {
  const lexer5 = new Lexer(test5);
  const tokens5 = lexer5.tokenize();

  const parser5 = new Parser(tokens5);
  const ast5 = parser5.parse();
  console.log('AST:', JSON.stringify(ast5, null, 2));
} catch (error) {
  console.error('Error:', error);
}

// Test 6: Python integration
console.log('\n=== Test 6: Python Integration ===');
const test6 = `
use "requests" as requests
`;

try {
  const lexer6 = new Lexer(test6);
  const tokens6 = lexer6.tokenize();

  const parser6 = new Parser(tokens6);
  const ast6 = parser6.parse();
  console.log('AST:', JSON.stringify(ast6, null, 2));
} catch (error) {
  console.error('Error:', error);
}

// Test 7: Complex expression
console.log('\n=== Test 7: Complex Expression ===');
const test7 = `
var result = (10 + 5) * 2 - 3 / 1
`;

try {
  const lexer7 = new Lexer(test7);
  const tokens7 = lexer7.tokenize();

  const parser7 = new Parser(tokens7);
  const ast7 = parser7.parse();
  console.log('AST:', JSON.stringify(ast7, null, 2));
} catch (error) {
  console.error('Error:', error);
}

// Test 8: Member access and method calls
console.log('\n=== Test 8: Member Access ===');
const test8 = `
var len = msg.content.length()
var first = items[0]
`;

try {
  const lexer8 = new Lexer(test8);
  const tokens8 = lexer8.tokenize();

  const parser8 = new Parser(tokens8);
  const ast8 = parser8.parse();
  console.log('AST:', JSON.stringify(ast8, null, 2));
} catch (error) {
  console.error('Error:', error);
}

console.log('\n=== All tests completed ===');
