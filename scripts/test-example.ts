/**
 * Test the example EzLang file
 */

import * as fs from 'fs';
import * as path from 'path';
import { Lexer } from './lexer';
import { Parser } from './parser';
import { logger, LogLevel } from './utils/logger';

// Set log level
logger.setLevel(LogLevel.INFO);

// Read the example file
const examplePath = path.join(__dirname, '..', 'examples', 'basic.ezlang');
const source = fs.readFileSync(examplePath, 'utf-8');

console.log('=== Parsing EzLang Example File ===\n');
console.log('Source code length:', source.length, 'characters\n');

try {
  // Tokenize
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  console.log('Tokens generated:', tokens.length);

  // Parse
  const parser = new Parser(tokens);
  const ast = parser.parse();
  console.log('AST statements:', ast.body.length);

  // Print statement types
  console.log('\nStatement types in AST:');
  ast.body.forEach((stmt, index) => {
    console.log(`  ${index + 1}. ${stmt.type}`);
  });

  console.log('\n=== Parsing successful! ===');
  console.log('\nSample AST (first 3 statements):');
  console.log(JSON.stringify(ast.body.slice(0, 3), null, 2));
} catch (error: any) {
  console.error('Error parsing example file:');
  if (error.formatError) {
    console.error(error.formatError());
  } else {
    console.error(error.message);
  }
  process.exit(1);
}
