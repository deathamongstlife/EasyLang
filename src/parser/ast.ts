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
 * Natural Language: start bot with token "abc"
 */
export interface StartBotCommand extends Statement {
  type: 'StartBotCommand';
  token: Expression;
}

/**
 * Natural Language: when message says "abc"
 */
export interface WhenMessageCommand extends Statement {
  type: 'WhenMessageCommand';
  condition: Expression;
  body: BlockStatement;
}

/**
 * Natural Language: when command "ping" is used
 */
export interface WhenCommandUsedCommand extends Statement {
  type: 'WhenCommandUsedCommand';
  commandName: Expression;
  body: BlockStatement;
}

/**
 * Natural Language: load [npm|python] package "xyz" as xyz
 */
export interface LoadPackageCommand extends Statement {
  type: 'LoadPackageCommand';
  packageManager: 'npm' | 'python';
  packageName: string;
  alias: string;
}

/**
 * Natural Language: reply with "abc"
 */
export interface ReplyWithCommand extends Statement {
  type: 'ReplyWithCommand';
  message: Expression;
}

/**
 * Natural Language: reply with embed "Title" "Description"
 */
export interface ReplyWithEmbedCommand extends Statement {
  type: 'ReplyWithEmbedCommand';
  title: Expression;
  description: Expression;
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
 * Natural Language: react with "emoji"
 */
export interface ReactWithCommand extends Statement {
  type: 'ReactWithCommand';
  emoji: Expression;
}

/**
 * Natural Language: send "message" to channel "id"
 */
export interface SendToCommand extends Statement {
  type: 'SendToCommand';
  message: Expression;
  target: Expression;
}

/**
 * Natural Language: set variable to expression
 */
export interface SetVariableCommand extends Statement {
  type: 'SetVariableCommand';
  name: string;
  value: Expression;
}

/**
 * Natural Language: when bot starts
 */
export interface WhenBotStartsCommand extends Statement {
  type: 'WhenBotStartsCommand';
  body: BlockStatement;
}

/**
 * Natural Language: when user joins server
 */
export interface WhenUserJoinsCommand extends Statement {
  type: 'WhenUserJoinsCommand';
  body: BlockStatement;
}

/**
 * Natural Language: when message starts with "text"
 */
export interface WhenMessageStartsWithCommand extends Statement {
  type: 'WhenMessageStartsWithCommand';
  condition: Expression;
  body: BlockStatement;
}

/**
 * Natural Language: when button "id" is clicked
 */
export interface WhenButtonClickedCommand extends Statement {
  type: 'WhenButtonClickedCommand';
  buttonId: Expression;
  body: BlockStatement;
}

/**
 * Moderation: ban user "name" [for "reason"]
 */
export interface BanCommand extends Statement {
  type: 'BanCommand';
  user: Expression;
  reason?: Expression;
}

/**
 * Moderation: kick user "name" [for "reason"]
 */
export interface KickCommand extends Statement {
  type: 'KickCommand';
  user: Expression;
  reason?: Expression;
}

/**
 * Moderation: timeout user "name" for <number> minutes
 */
export interface TimeoutCommand extends Statement {
  type: 'TimeoutCommand';
  user: Expression;
  duration: Expression;
}

/**
 * Roles: add role "Admin" to user "Bob"
 */
export interface AddRoleCommand extends Statement {
  type: 'AddRoleCommand';
  role: Expression;
  user: Expression;
}

/**
 * Roles: remove role "Muted" from user "Bob"
 */
export interface RemoveRoleCommand extends Statement {
  type: 'RemoveRoleCommand';
  role: Expression;
  user: Expression;
}

/**
 * Threads: create thread "Help"
 */
export interface CreateThreadCommand extends Statement {
  type: 'CreateThreadCommand';
  name: Expression;
}

/**
 * Voice: join voice channel "id"
 */
export interface JoinVoiceCommand extends Statement {
  type: 'JoinVoiceCommand';
  channel: Expression;
}

/**
 * Voice: play audio "music.mp3"
 */
export interface PlayAudioCommand extends Statement {
  type: 'PlayAudioCommand';
  file: Expression;
}

/**
 * Slash Commands: register slash command "name" with description "desc"
 */
export interface RegisterSlashCommand extends Statement {
  type: 'RegisterSlashCommand';
  name: Expression;
  description: Expression;
  options: SlashCommandOption[];
}

export interface SlashCommandOption {
  name: Expression;
  description: Expression;
  type: string; // "string", "number", "user", "role", "boolean"
  required: boolean;
}

/**
 * Components: reply with button "id" labeled "text" style "primary"
 */
export interface ReplyWithButtonCommand extends Statement {
  type: 'ReplyWithButtonCommand';
  message: Expression;
  buttonId: Expression;
  label: Expression;
  style: string;
}

/**
 * Components: reply with menu "id" with options [...]
 */
export interface ReplyWithMenuCommand extends Statement {
  type: 'ReplyWithMenuCommand';
  message: Expression;
  menuId: Expression;
  options: MenuOption[];
}

export interface MenuOption {
  label: Expression;
  value: Expression;
  description?: Expression;
}

/**
 * NLP Condition: if user has role "Admin"
 */
export interface IfUserHasRoleStatement extends Statement {
  type: 'IfUserHasRoleStatement';
  user: Expression;
  role: Expression;
  consequent: BlockStatement;
  alternate: BlockStatement | null;
}

/**
 * NLP Condition: if user has permission "BAN_MEMBERS"
 */
export interface IfUserHasPermissionStatement extends Statement {
  type: 'IfUserHasPermissionStatement';
  user: Expression;
  permission: Expression;
  consequent: BlockStatement;
  alternate: BlockStatement | null;
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
    node.type === 'ReactCommand' ||
    node.type === 'StartBotCommand' ||
    node.type === 'WhenMessageCommand' ||
    node.type === 'WhenCommandUsedCommand' ||
    node.type === 'LoadPackageCommand' ||
    node.type === 'ReplyWithCommand' ||
    node.type === 'ReplyWithEmbedCommand' ||
    node.type === 'ReactWithCommand' ||
    node.type === 'SendToCommand' ||
    node.type === 'SetVariableCommand' ||
    node.type === 'WhenBotStartsCommand' ||
    node.type === 'WhenUserJoinsCommand' ||
    node.type === 'WhenMessageStartsWithCommand' ||
    node.type === 'WhenButtonClickedCommand' ||
    node.type === 'BanCommand' ||
    node.type === 'KickCommand' ||
    node.type === 'TimeoutCommand' ||
    node.type === 'AddRoleCommand' ||
    node.type === 'RemoveRoleCommand' ||
    node.type === 'CreateThreadCommand' ||
    node.type === 'JoinVoiceCommand' ||
    node.type === 'PlayAudioCommand' ||
    node.type === 'RegisterSlashCommand' ||
    node.type === 'ReplyWithButtonCommand' ||
    node.type === 'ReplyWithMenuCommand' ||
    node.type === 'IfUserHasRoleStatement' ||
    node.type === 'IfUserHasPermissionStatement'
  );
}
