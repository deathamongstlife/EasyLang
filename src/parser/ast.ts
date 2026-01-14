/**
 * Abstract Syntax Tree (AST) node definitions for EzLang
 */

import { Position } from '../types';

/**
 * Base interface for all AST nodes
 */
export interface ASTNode {
  type: string;
  position?: Position;
}

/**
 * Root program node
 */
export interface Program extends ASTNode {
  type: 'Program';
  body: Statement[];
}

/**
 * Base interface for statements
 */
export interface Statement extends ASTNode {}

/**
 * Base interface for expressions
 */
export interface Expression extends ASTNode {}

/**
 * Variable declaration: var name = value
 */
export interface VariableDeclaration extends Statement {
  type: 'VariableDeclaration';
  name: string;
  initializer: Expression | null;
}

/**
 * Function declaration: function name(params) { body }
 */
export interface FunctionDeclaration extends Statement {
  type: 'FunctionDeclaration';
  name: string;
  parameters: string[];
  body: BlockStatement;
}

/**
 * If statement: if condition { consequent } else { alternate }
 */
export interface IfStatement extends Statement {
  type: 'IfStatement';
  condition: Expression;
  consequent: BlockStatement;
  alternate: BlockStatement | null;
}

/**
 * For loop: for variable in iterable { body }
 */
export interface ForStatement extends Statement {
  type: 'ForStatement';
  variable: string;
  iterable: Expression;
  body: BlockStatement;
}

/**
 * While loop: while condition { body }
 */
export interface WhileStatement extends Statement {
  type: 'WhileStatement';
  condition: Expression;
  body: BlockStatement;
}

/**
 * Return statement: return value
 */
export interface ReturnStatement extends Statement {
  type: 'ReturnStatement';
  value: Expression | null;
}

/**
 * Block statement: { statements }
 */
export interface BlockStatement extends Statement {
  type: 'BlockStatement';
  statements: Statement[];
}

/**
 * Expression statement
 */
export interface ExpressionStatement extends Statement {
  type: 'ExpressionStatement';
  expression: Expression;
}

/**
 * Listen statement: listen "event" (param) { body }
 */
export interface ListenStatement extends Statement {
  type: 'ListenStatement';
  event: string;
  parameter: string;
  body: BlockStatement;
}

/**
 * Use statement: use "module" as name
 */
export interface UseStatement extends Statement {
  type: 'UseStatement';
  module: string;
  alias: string;
}

/**
 * Import statement: import "path/to/file.ez"
 */
export interface ImportStatement extends Statement {
  type: 'ImportStatement';
  path: string;
}

/**
 * Discord send command: send channel message
 */
export interface SendCommand extends Statement {
  type: 'SendCommand';
  target: Expression;
  message: Expression;
}

/**
 * Discord reply command: reply message response
 */
export interface ReplyCommand extends Statement {
  type: 'ReplyCommand';
  target: Expression;
  message: Expression;
}

/**
 * Discord react command: react message emoji
 */
export interface ReactCommand extends Statement {
  type: 'ReactCommand';
  target: Expression;
  emoji: Expression;
}

/**
 * Binary expression: left operator right
 */
export interface BinaryExpression extends Expression {
  type: 'BinaryExpression';
  operator: string;
  left: Expression;
  right: Expression;
}

/**
 * Unary expression: operator operand
 */
export interface UnaryExpression extends Expression {
  type: 'UnaryExpression';
  operator: string;
  operand: Expression;
}

/**
 * Call expression: callee(arguments)
 */
export interface CallExpression extends Expression {
  type: 'CallExpression';
  callee: Expression;
  arguments: Expression[];
}

/**
 * Member expression: object.property
 */
export interface MemberExpression extends Expression {
  type: 'MemberExpression';
  object: Expression;
  property: Expression;
  computed: boolean; // true for obj[prop], false for obj.prop
}

/**
 * Identifier
 */
export interface Identifier extends Expression {
  type: 'Identifier';
  name: string;
}

/**
 * Literal value
 */
export interface Literal extends Expression {
  type: 'Literal';
  value: string | number | boolean | null;
  raw: string;
}

/**
 * Array literal: [elements]
 */
export interface ArrayLiteral extends Expression {
  type: 'ArrayLiteral';
  elements: Expression[];
}

/**
 * Object literal: {key: value, ...}
 */
export interface ObjectLiteral extends Expression {
  type: 'ObjectLiteral';
  properties: ObjectProperty[];
}

/**
 * Object property in an object literal
 */
export interface ObjectProperty extends ASTNode {
  type: 'ObjectProperty';
  key: string;
  value: Expression;
}

/**
 * Assignment expression: target = value
 */
export interface AssignmentExpression extends Expression {
  type: 'AssignmentExpression';
  target: Identifier | MemberExpression;
  value: Expression;
}

/**
 * Type guard functions
 */
export function isExpression(node: ASTNode): node is Expression {
  return (
    node.type === 'BinaryExpression' ||
    node.type === 'UnaryExpression' ||
    node.type === 'CallExpression' ||
    node.type === 'MemberExpression' ||
    node.type === 'Identifier' ||
    node.type === 'Literal' ||
    node.type === 'ArrayLiteral' ||
    node.type === 'ObjectLiteral' ||
    node.type === 'AssignmentExpression'
  );
}

export function isStatement(node: ASTNode): node is Statement {
  return (
    node.type === 'VariableDeclaration' ||
    node.type === 'FunctionDeclaration' ||
    node.type === 'IfStatement' ||
    node.type === 'ForStatement' ||
    node.type === 'WhileStatement' ||
    node.type === 'ReturnStatement' ||
    node.type === 'BlockStatement' ||
    node.type === 'ExpressionStatement' ||
    node.type === 'ListenStatement' ||
    node.type === 'UseStatement' ||
    node.type === 'ImportStatement' ||
    node.type === 'SendCommand' ||
    node.type === 'ReplyCommand' ||
    node.type === 'ReactCommand'
  );
}
