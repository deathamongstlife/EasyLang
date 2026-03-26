/**
 * Runtime (Interpreter) for EzLang
 * Executes the AST produced by the parser
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  Program,
  Statement,
  Expression,
  VariableDeclaration,
  FunctionDeclaration,
  IfStatement,
  ForStatement,
  WhileStatement,
  ReturnStatement,
  BlockStatement,
  ExpressionStatement,
  ListenStatement,
  UseStatement,
  ImportStatement,
  SendCommand,
  ReplyCommand,
  ReactCommand,
  StartBotCommand,
  WhenMessageCommand,
  WhenCommandUsedCommand,
  LoadPackageCommand,
  ReplyWithCommand,
  ReplyWithEmbedCommand,
  ReactWithCommand,
  SendToCommand,
  SetVariableCommand,
  WhenBotStartsCommand,
  WhenUserJoinsCommand,
  WhenMessageStartsWithCommand,
  WhenButtonClickedCommand,
  BanCommand,
  KickCommand,
  TimeoutCommand,
  AddRoleCommand,
  RemoveRoleCommand,
  CreateThreadCommand,
  JoinVoiceCommand,
  PlayAudioCommand,
  RegisterSlashCommand,
  ReplyWithButtonCommand,
  ReplyWithMenuCommand,
  IfUserHasRoleStatement,
  IfUserHasPermissionStatement,
  BinaryExpression,
  UnaryExpression,
  CallExpression,
  MemberExpression,
  Identifier,
  Literal,
  ArrayLiteral,
  ObjectLiteral,
  AssignmentExpression,
} from '../parser/ast';
import { Environment } from './environment';
import { createGlobalEnvironment } from './builtins';
import {
  RuntimeValue,
  makeNumber,
  makeString,
  makeBoolean,
  makeNull,
  makeArray,
  makeObject,
  makeFunction,
  makeReturn,
  isNumber,
  isString,
  isArray,
  isObject,
  isFunction,
  isNativeFunction,
  isReturn,
  isPython,
  isTruthy,
  valuesEqual,
  valueToString,
  makePython,
} from './values';
import { RuntimeError, TypeError, UndefinedFunctionError } from '../utils/errors';
import { logger } from '../utils/logger';
import { DiscordManager } from '../discord';
import { send, reply, react, replyWithEmbed } from '../discord/commands';
import { EventManager } from '../discord/events';
import { PythonBridge } from '../python';
import { PythonProxy } from '../python/proxy';
import { JavaScriptBridge } from '../javascript';
import { PackageResolver } from '../packages/resolver';
import { Lexer } from '../lexer';
import { Parser } from '../parser';

export class Runtime {
  private program: Program;
  private globalEnv: Environment;
  public discordManager: DiscordManager;
  private eventManager: EventManager;
  public pythonBridge: PythonBridge;
  private pythonProxies: Map<string, PythonProxy> = new Map();
  private importedFiles: Set<string> = new Set();
  private currentFilePath: string = '';

  constructor(program: Program, filePath: string = '') {
    this.program = program;
    this.currentFilePath = filePath;
    this.discordManager = new DiscordManager();
    this.eventManager = new EventManager();
    this.pythonBridge = new PythonBridge();
    const jsBridge = JavaScriptBridge.getInstance();
    const resolver = PackageResolver.getInstance();
    this.globalEnv = createGlobalEnvironment(this.discordManager, this.pythonBridge, jsBridge, resolver);
  }
  /**
   * Get a variable from the global environment (for testing purposes)
   */
  getVariable(name: string): RuntimeValue {
    return this.globalEnv.lookup(name);
  }

  /**
   * Execute the program
   */
  async execute(): Promise<void> {
    logger.debug('Runtime: Starting execution');
    try {
      // Initialize Python bridge (optional - will fail silently if Python not available)
      try {
        await this.pythonBridge.initialize();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.debug(`Python bridge not available: ${errorMessage}`);
      }

      for (const statement of this.program.body) {
        await this.evaluateStatement(statement, this.globalEnv);
      }
      logger.debug('Runtime: Execution completed successfully');
    } catch (error) {
      if (error instanceof RuntimeError) {
        logger.error(error.formatError());
        throw error;
      }
      throw error;
    } finally {
      // Cleanup Python bridge
      await this.pythonBridge.cleanup();
    }
  }

  /**
   * Evaluate a statement
   */
  private async evaluateStatement(node: Statement, env: Environment): Promise<RuntimeValue> {
    switch (node.type) {
      case 'VariableDeclaration':
        return this.evaluateVariableDeclaration(node as VariableDeclaration, env);
      case 'FunctionDeclaration':
        return this.evaluateFunctionDeclaration(node as FunctionDeclaration, env);
      case 'IfStatement':
        return this.evaluateIfStatement(node as IfStatement, env);
      case 'ForStatement':
        return this.evaluateForStatement(node as ForStatement, env);
      case 'WhileStatement':
        return this.evaluateWhileStatement(node as WhileStatement, env);
      case 'ReturnStatement':
        return this.evaluateReturnStatement(node as ReturnStatement, env);
      case 'BlockStatement':
        return this.evaluateBlockStatement(node as BlockStatement, env);
      case 'ExpressionStatement':
        return this.evaluateExpressionStatement(node as ExpressionStatement, env);
      case 'ListenStatement':
        return this.evaluateListenStatement(node as ListenStatement, env);
      case 'UseStatement':
        return this.evaluateUseStatement(node as UseStatement, env);
      case 'ImportStatement':
        return this.evaluateImportStatement(node as ImportStatement, env);
      case 'SendCommand':
        return this.evaluateSendCommand(node as SendCommand, env);
      case 'ReplyCommand':
        return this.evaluateReplyCommand(node as ReplyCommand, env);
      case 'ReplyWithCommand':
        return this.evaluateReplyWithCommand(node as ReplyWithCommand, env);
      case 'ReplyWithEmbedCommand':
        return this.evaluateReplyWithEmbedCommand(node as ReplyWithEmbedCommand, env);
      case 'ReactCommand':
        return this.evaluateReactCommand(node as ReactCommand, env);
      case 'ReactWithCommand':
        return this.evaluateReactWithCommand(node as ReactWithCommand, env);
      case 'SendToCommand':
        return this.evaluateSendToCommand(node as SendToCommand, env);
      case 'SetVariableCommand':
        return this.evaluateSetVariableCommand(node as SetVariableCommand, env);
      case 'StartBotCommand':
        return this.evaluateStartBotCommand(node as StartBotCommand, env);
      case 'LoadPackageCommand':
        return this.evaluateLoadPackageCommand(node as LoadPackageCommand, env);
      case 'WhenMessageCommand':
        return this.evaluateWhenMessageCommand(node as WhenMessageCommand, env);
      case 'WhenCommandUsedCommand':
        return this.evaluateWhenCommandUsedCommand(node as WhenCommandUsedCommand, env);
      case 'WhenBotStartsCommand':
        return this.evaluateWhenBotStartsCommand(node as WhenBotStartsCommand, env);
      case 'WhenUserJoinsCommand':
        return this.evaluateWhenUserJoinsCommand(node as WhenUserJoinsCommand, env);
      case 'WhenMessageStartsWithCommand':
        return this.evaluateWhenMessageStartsWithCommand(node as WhenMessageStartsWithCommand, env);
      case 'WhenButtonClickedCommand':
        return this.evaluateWhenButtonClickedCommand(node as WhenButtonClickedCommand, env);
      case 'BanCommand':
        return this.evaluateBanCommand(node as BanCommand, env);
      case 'KickCommand':
        return this.evaluateKickCommand(node as KickCommand, env);
      case 'TimeoutCommand':
        return this.evaluateTimeoutCommand(node as TimeoutCommand, env);
      case 'AddRoleCommand':
        return this.evaluateAddRoleCommand(node as AddRoleCommand, env);
      case 'RemoveRoleCommand':
        return this.evaluateRemoveRoleCommand(node as RemoveRoleCommand, env);
      case 'CreateThreadCommand':
        return this.evaluateCreateThreadCommand(node as CreateThreadCommand, env);
      case 'JoinVoiceCommand':
        return this.evaluateJoinVoiceCommand(node as JoinVoiceCommand, env);
      case 'PlayAudioCommand':
        return this.evaluatePlayAudioCommand(node as PlayAudioCommand, env);
      case 'RegisterSlashCommand':
        return this.evaluateRegisterSlashCommand(node as RegisterSlashCommand, env);
      case 'ReplyWithButtonCommand':
        return this.evaluateReplyWithButtonCommand(node as ReplyWithButtonCommand, env);
      case 'ReplyWithMenuCommand':
        return this.evaluateReplyWithMenuCommand(node as ReplyWithMenuCommand, env);
      case 'IfUserHasRoleStatement':
        return this.evaluateIfUserHasRoleStatement(node as IfUserHasRoleStatement, env);
      case 'IfUserHasPermissionStatement':
        return this.evaluateIfUserHasPermissionStatement(node as IfUserHasPermissionStatement, env);
      default:
        throw new RuntimeError(
          `Unknown statement type: ${node.type}`,
          node.position?.line,
          node.position?.column
        );
    }
  }

  /**
   * Evaluate an expression
   */
  private async evaluateExpression(node: Expression, env: Environment): Promise<RuntimeValue> {
    switch (node.type) {
      case 'Literal':
        return this.evaluateLiteral(node as Literal);
      case 'Identifier':
        return this.evaluateIdentifier(node as Identifier, env);
      case 'BinaryExpression':
        return this.evaluateBinaryExpression(node as BinaryExpression, env);
      case 'UnaryExpression':
        return this.evaluateUnaryExpression(node as UnaryExpression, env);
      case 'CallExpression':
        return this.evaluateCallExpression(node as CallExpression, env);
      case 'MemberExpression':
        return this.evaluateMemberExpression(node as MemberExpression, env);
      case 'ArrayLiteral':
        return this.evaluateArrayLiteral(node as ArrayLiteral, env);
      case 'ObjectLiteral':
        return this.evaluateObjectLiteral(node as ObjectLiteral, env);
      case 'AssignmentExpression':
        return this.evaluateAssignmentExpression(node as AssignmentExpression, env);
      default:
        throw new RuntimeError(
          `Unknown expression type: ${node.type}`,
          node.position?.line,
          node.position?.column
        );
    }
  }

  /**
   * Evaluate a variable declaration
   */
  private async evaluateVariableDeclaration(
    node: VariableDeclaration,
    env: Environment
  ): Promise<RuntimeValue> {
    const value = node.initializer
      ? await this.evaluateExpression(node.initializer, env)
      : makeNull();

    env.declare(node.name, value);
    return makeNull();
  }

  /**
   * Evaluate a function declaration
   */
  private async evaluateFunctionDeclaration(
    node: FunctionDeclaration,
    env: Environment
  ): Promise<RuntimeValue> {
    const func = makeFunction(node.name, node.parameters, node.body, env);
    env.declare(node.name, func);
    return makeNull();
  }

  /**
   * Evaluate an if statement
   */
  private async evaluateIfStatement(node: IfStatement, env: Environment): Promise<RuntimeValue> {
    const condition = await this.evaluateExpression(node.condition, env);

    if (isTruthy(condition)) {
      return this.evaluateBlockStatement(node.consequent, env);
    } else if (node.alternate) {
      return this.evaluateBlockStatement(node.alternate, env);
    }

    return makeNull();
  }

  /**
   * Evaluate a for statement (for...in loop)
   */
  private async evaluateForStatement(node: ForStatement, env: Environment): Promise<RuntimeValue> {
    const iterable = await this.evaluateExpression(node.iterable, env);

    if (!isArray(iterable)) {
      throw new TypeError(
        `for...in requires an iterable (array), got ${iterable.type}`,
        node.position?.line,
        node.position?.column
      );
    }

    // Create new scope for loop variable
    const loopEnv = env.extend();

    for (const element of iterable.elements) {
      // Declare/update loop variable
      if (loopEnv.isDeclared(node.variable)) {
        loopEnv.assign(node.variable, element);
      } else {
        loopEnv.declare(node.variable, element);
      }

      // Execute loop body
      const result = await this.evaluateBlockStatement(node.body, loopEnv);

      // Handle return statements
      if (isReturn(result)) {
        return result;
      }
    }

    return makeNull();
  }

  /**
   * Evaluate a while statement
   */
  private async evaluateWhileStatement(
    node: WhileStatement,
    env: Environment
  ): Promise<RuntimeValue> {
    while (true) {
      const condition = await this.evaluateExpression(node.condition, env);

      if (!isTruthy(condition)) {
        break;
      }

      const result = await this.evaluateBlockStatement(node.body, env);

      // Handle return statements
      if (isReturn(result)) {
        return result;
      }
    }

    return makeNull();
  }

  /**
   * Evaluate a return statement
   */
  private async evaluateReturnStatement(
    node: ReturnStatement,
    env: Environment
  ): Promise<RuntimeValue> {
    const value = node.value ? await this.evaluateExpression(node.value, env) : makeNull();
    return makeReturn(value);
  }

  /**
   * Evaluate a block statement
   */
  private async evaluateBlockStatement(
    node: BlockStatement,
    env: Environment
  ): Promise<RuntimeValue> {
    // Create new scope for block
    const blockEnv = env.extend();

    for (const statement of node.statements) {
      const result = await this.evaluateStatement(statement, blockEnv);

      // Propagate return values
      if (isReturn(result)) {
        return result;
      }
    }

    return makeNull();
  }

  /**
   * Evaluate an expression statement
   */
  private async evaluateExpressionStatement(
    node: ExpressionStatement,
    env: Environment
  ): Promise<RuntimeValue> {
    return this.evaluateExpression(node.expression, env);
  }

  /**
   * Evaluate a literal
   */
  private evaluateLiteral(node: Literal): RuntimeValue {
    if (node.value === null) {
      return makeNull();
    }
    if (typeof node.value === 'number') {
      return makeNumber(node.value);
    }
    if (typeof node.value === 'string') {
      return makeString(node.value);
    }
    if (typeof node.value === 'boolean') {
      return makeBoolean(node.value);
    }

    throw new RuntimeError(
      `Unknown literal type: ${typeof node.value}`,
      node.position?.line,
      node.position?.column
    );
  }

  /**
   * Evaluate an identifier
   */
  private evaluateIdentifier(node: Identifier, env: Environment): RuntimeValue {
    try {
      return env.lookup(node.name);
    } catch (error) {
      if (error instanceof RuntimeError) {
        // Add position information if available
        throw new RuntimeError(error.message, node.position?.line, node.position?.column);
      }
      throw error;
    }
  }

  /**
   * Evaluate a binary expression
   */
  private async evaluateBinaryExpression(
    node: BinaryExpression,
    env: Environment
  ): Promise<RuntimeValue> {
    const left = await this.evaluateExpression(node.left, env);
    const right = await this.evaluateExpression(node.right, env);

    // Arithmetic operators
    if (node.operator === '+') {
      return this.evaluateAddition(left, right, node);
    }
    if (node.operator === '-') {
      return this.evaluateArithmetic(left, right, (a, b) => a - b, node);
    }
    if (node.operator === '*') {
      return this.evaluateArithmetic(left, right, (a, b) => a * b, node);
    }
    if (node.operator === '/') {
      return this.evaluateArithmetic(left, right, (a, b) => a / b, node);
    }
    if (node.operator === '%') {
      return this.evaluateArithmetic(left, right, (a, b) => a % b, node);
    }

    // Comparison operators
    if (node.operator === '==') {
      return makeBoolean(valuesEqual(left, right));
    }
    if (node.operator === '!=') {
      return makeBoolean(!valuesEqual(left, right));
    }
    if (node.operator === '<') {
      return this.evaluateComparison(left, right, (a, b) => a < b, node);
    }
    if (node.operator === '>') {
      return this.evaluateComparison(left, right, (a, b) => a > b, node);
    }
    if (node.operator === '<=') {
      return this.evaluateComparison(left, right, (a, b) => a <= b, node);
    }
    if (node.operator === '>=') {
      return this.evaluateComparison(left, right, (a, b) => a >= b, node);
    }

    // Logical operators
    if (node.operator === '&&') {
      return makeBoolean(isTruthy(left) && isTruthy(right));
    }
    if (node.operator === '||') {
      return makeBoolean(isTruthy(left) || isTruthy(right));
    }

    // In operator
    if (node.operator === 'in') {
      if (!isString(left)) {
        throw new TypeError(
          `'in' operator requires string key, got ${left.type}`,
          node.position?.line,
          node.position?.column
        );
      }

      if (!isObject(right)) {
        throw new TypeError(
          `'in' operator requires object, got ${right.type}`,
          node.position?.line,
          node.position?.column
        );
      }

      return makeBoolean(right.properties.has(left.value));
    }

    throw new RuntimeError(
      `Unknown binary operator: ${node.operator}`,
      node.position?.line,
      node.position?.column
    );
  }

  /**
   * Evaluate addition (handles both numbers and string concatenation)
   */
  private evaluateAddition(
    left: RuntimeValue,
    right: RuntimeValue,
    node: BinaryExpression
  ): RuntimeValue {
    // String concatenation
    if (isString(left) || isString(right)) {
      return makeString(valueToString(left) + valueToString(right));
    }

    // Numeric addition
    if (isNumber(left) && isNumber(right)) {
      return makeNumber(left.value + right.value);
    }

    throw new TypeError(
      `Cannot add ${left.type} and ${right.type}`,
      node.position?.line,
      node.position?.column
    );
  }

  /**
   * Evaluate arithmetic operations
   */
  private evaluateArithmetic(
    left: RuntimeValue,
    right: RuntimeValue,
    operation: (a: number, b: number) => number,
    node: BinaryExpression
  ): RuntimeValue {
    if (!isNumber(left) || !isNumber(right)) {
      throw new TypeError(
        `Arithmetic operation requires numbers, got ${left.type} and ${right.type}`,
        node.position?.line,
        node.position?.column
      );
    }

    return makeNumber(operation(left.value, right.value));
  }

  /**
   * Evaluate comparison operations
   */
  private evaluateComparison(
    left: RuntimeValue,
    right: RuntimeValue,
    operation: (a: number, b: number) => boolean,
    node: BinaryExpression
  ): RuntimeValue {
    if (!isNumber(left) || !isNumber(right)) {
      throw new TypeError(
        `Comparison operation requires numbers, got ${left.type} and ${right.type}`,
        node.position?.line,
        node.position?.column
      );
    }

    return makeBoolean(operation(left.value, right.value));
  }

  /**
   * Evaluate a unary expression
   */
  private async evaluateUnaryExpression(
    node: UnaryExpression,
    env: Environment
  ): Promise<RuntimeValue> {
    const operand = await this.evaluateExpression(node.operand, env);

    if (node.operator === '-') {
      if (!isNumber(operand)) {
        throw new TypeError(
          `Unary minus requires a number, got ${operand.type}`,
          node.position?.line,
          node.position?.column
        );
      }
      return makeNumber(-operand.value);
    }

    if (node.operator === '!') {
      return makeBoolean(!isTruthy(operand));
    }

    throw new RuntimeError(
      `Unknown unary operator: ${node.operator}`,
      node.position?.line,
      node.position?.column
    );
  }

  /**
   * Evaluate a call expression
   */
  private async evaluateCallExpression(
    node: CallExpression,
    env: Environment
  ): Promise<RuntimeValue> {
    const callee = await this.evaluateExpression(node.callee, env);

    // Evaluate arguments
    const args: RuntimeValue[] = [];
    for (const arg of node.arguments) {
      args.push(await this.evaluateExpression(arg, env));
    }

    // Call native function
    if (isNativeFunction(callee)) {
      return callee.call(args, env);
    }

    // Call user-defined function
    if (isFunction(callee)) {
      // Check parameter count
      if (args.length !== callee.parameters.length) {
        throw new RuntimeError(
          `Function '${callee.name}' expects ${callee.parameters.length} arguments, got ${args.length}`,
          node.position?.line,
          node.position?.column
        );
      }

      // Create new environment for function execution (using closure)
      const funcEnv = callee.closure.extend();

      // Bind parameters
      for (let i = 0; i < callee.parameters.length; i++) {
        funcEnv.define(callee.parameters[i], args[i]);
      }

      // Execute function body
      const result = await this.evaluateBlockStatement(callee.body, funcEnv);

      // Unwrap return value
      if (isReturn(result)) {
        return result.value;
      }

      return makeNull();
    }

    throw new UndefinedFunctionError(
      valueToString(callee),
      node.position?.line,
      node.position?.column
    );
  }

  /**
   * Evaluate a member expression (object.property or array[index])
   */
  private async evaluateMemberExpression(
    node: MemberExpression,
    env: Environment
  ): Promise<RuntimeValue> {
    const object = await this.evaluateExpression(node.object, env);

    // Python module access
    if (isPython(object)) {
      let propertyName: string;

      if (node.computed) {
        const property = await this.evaluateExpression(node.property, env);
        propertyName = valueToString(property);
      } else {
        if (node.property.type !== 'Identifier') {
          throw new RuntimeError(
            'Invalid property access',
            node.position?.line,
            node.position?.column
          );
        }
        propertyName = (node.property as Identifier).name;
      }

      // Get proxy for this module
      const proxy = this.pythonProxies.get(object.moduleName);
      if (!proxy) {
        throw new RuntimeError(
          `Python module proxy not found for '${object.moduleName}'`,
          node.position?.line,
          node.position?.column
        );
      }

      // Get attribute from Python
      try {
        return await proxy.getAttribute([propertyName]);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new RuntimeError(
          errorMessage,
          node.position?.line,
          node.position?.column
        );
      }
    }

    // Array access
    if (isArray(object)) {
      const property = await this.evaluateExpression(node.property, env);

      if (!isNumber(property)) {
        throw new TypeError(
          `Array index must be a number, got ${property.type}`,
          node.position?.line,
          node.position?.column
        );
      }

      const index = Math.floor(property.value);
      if (index < 0 || index >= object.elements.length) {
        throw new RuntimeError(
          `Array index out of bounds: ${index}`,
          node.position?.line,
          node.position?.column
        );
      }

      return object.elements[index];
    }

    // Object access
    if (isObject(object)) {
      let propertyName: string;

      if (node.computed) {
        const property = await this.evaluateExpression(node.property, env);
        propertyName = valueToString(property);
      } else {
        // Non-computed member access (obj.prop)
        if (node.property.type !== 'Identifier') {
          throw new RuntimeError(
            'Invalid property access',
            node.position?.line,
            node.position?.column
          );
        }
        propertyName = (node.property as Identifier).name;
      }

      if (!object.properties.has(propertyName)) {
        return makeNull();
      }

      return object.properties.get(propertyName)!;
    }

    throw new TypeError(
      `Cannot access property of ${object.type}`,
      node.position?.line,
      node.position?.column
    );
  }

  /**
   * Evaluate an array literal
   */
  private async evaluateArrayLiteral(node: ArrayLiteral, env: Environment): Promise<RuntimeValue> {
    const elements: RuntimeValue[] = [];

    for (const element of node.elements) {
      elements.push(await this.evaluateExpression(element, env));
    }

    return makeArray(elements);
  }

  /**
   * Evaluate an object literal
   */
  private async evaluateObjectLiteral(node: ObjectLiteral, env: Environment): Promise<RuntimeValue> {
    const obj = makeObject(new Map());

    for (const prop of node.properties) {
      const value = await this.evaluateExpression(prop.value, env);
      obj.properties.set(prop.key, value);
    }

    return obj;
  }

  /**
   * Evaluate an assignment expression
   */
  private async evaluateAssignmentExpression(
    node: AssignmentExpression,
    env: Environment
  ): Promise<RuntimeValue> {
    const value = await this.evaluateExpression(node.value, env);

    // Simple identifier assignment
    if (node.target.type === 'Identifier') {
      env.assign(node.target.name, value);
      return value;
    }

    // Member expression assignment (array[index] = value or obj.prop = value)
    if (node.target.type === 'MemberExpression') {
      const memberExpr = node.target as MemberExpression;
      const object = await this.evaluateExpression(memberExpr.object, env);

      // Array element assignment
      if (isArray(object)) {
        const property = await this.evaluateExpression(memberExpr.property, env);

        if (!isNumber(property)) {
          throw new TypeError(
            `Array index must be a number, got ${property.type}`,
            node.position?.line,
            node.position?.column
          );
        }

        const index = Math.floor(property.value);
        if (index < 0 || index >= object.elements.length) {
          throw new RuntimeError(
            `Array index out of bounds: ${index}`,
            node.position?.line,
            node.position?.column
          );
        }

        object.elements[index] = value;
        return value;
      }

      // Object property assignment
      if (isObject(object)) {
        let propertyName: string;

        if (memberExpr.computed) {
          const property = await this.evaluateExpression(memberExpr.property, env);
          propertyName = valueToString(property);
        } else {
          if (memberExpr.property.type !== 'Identifier') {
            throw new RuntimeError(
              'Invalid property access',
              node.position?.line,
              node.position?.column
            );
          }
          propertyName = (memberExpr.property as Identifier).name;
        }

        object.properties.set(propertyName, value);
        return value;
      }

      throw new TypeError(
        `Cannot assign property of ${object.type}`,
        node.position?.line,
        node.position?.column
      );
    }

    throw new RuntimeError(
      'Invalid assignment target',
      node.position?.line,
      node.position?.column
    );
  }

  /**
   * Evaluate a listen statement (Discord event handler)
   */
  private async evaluateListenStatement(
    node: ListenStatement,
    env: Environment
  ): Promise<RuntimeValue> {
    const eventName = node.event;
    const paramName = node.parameter;

    // Create a handler function that will be called when the event occurs
    const handler = async (...eventArgs: unknown[]) => {
      // Create new environment for the handler
      const handlerEnv = env.extend();

      // Convert Discord.js event args to RuntimeValue using EventManager
      const runtimeArgs = this.eventManager.convertEventArgs(eventName, eventArgs);

      // Bind the parameter (use first arg for most events, or handle multiple params)
      if (runtimeArgs.length > 0) {
        handlerEnv.define(paramName, runtimeArgs[0]);
      }

      // For events with multiple parameters, bind additional named params
      // e.g., voiceStateUpdate has oldState and newState
      if (runtimeArgs.length > 1) {
        // Store additional args in array accessible via special variable
        handlerEnv.define(`${paramName}_args`, makeArray(runtimeArgs));
      }

      // Execute the handler body
      try {
        await this.evaluateBlockStatement(node.body, handlerEnv);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Error in ${eventName} handler: ${errorMessage}`);
        if (error instanceof RuntimeError) {
          logger.error(error.formatError());
        }
      }
    };

    // Register the handler with Discord manager
    this.discordManager.registerEventHandler(eventName, handler);

    logger.debug(`Registered listener for event '${eventName}'`);
    return makeNull();
  }

  /**
   * Evaluate a use statement (Python module import)
   */
  private async evaluateUseStatement(node: UseStatement, env: Environment): Promise<RuntimeValue> {
    const moduleName = node.module;
    const alias = node.alias;

    try {
      // Import the Python module
      await this.pythonBridge.importModule(moduleName);

      // Create a proxy for the module
      const proxy = new PythonProxy(moduleName, this.pythonBridge);
      this.pythonProxies.set(moduleName, proxy);

      // Create a Python value and store in environment
      const proxyObject = proxy.createProxy();
      const pythonValue = makePython(moduleName, proxyObject);

      env.declare(alias, pythonValue);

      logger.debug(`Imported Python module '${moduleName}' as '${alias}'`);
      return makeNull();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new RuntimeError(
        errorMessage,
        node.position?.line,
        node.position?.column
      );
    }
  }

  /**
   * Evaluate an import statement: import "path/to/file.ez"
   */
  private async evaluateImportStatement(
    node: ImportStatement,
    env: Environment
  ): Promise<RuntimeValue> {
    let importPath = node.path;

    // Resolve the import path relative to the current file
    let resolvedPath: string;

    if (path.isAbsolute(importPath)) {
      // Absolute path
      resolvedPath = importPath;
    } else {
      // Relative path - resolve relative to current file's directory
      const currentDir = this.currentFilePath ? path.dirname(this.currentFilePath) : process.cwd();
      resolvedPath = path.resolve(currentDir, importPath);
    }

    // Ensure .ez extension
    if (!resolvedPath.endsWith('.ez')) {
      resolvedPath += '.ez';
    }

    // Normalize path for consistency in tracking
    resolvedPath = path.normalize(resolvedPath);

    // Check for circular imports - mark BEFORE processing to prevent infinite loops
    if (this.importedFiles.has(resolvedPath)) {
      logger.debug(`Skipping already imported file: ${resolvedPath}`);
      return makeNull();
    }

    // Mark this file as imported to prevent circular imports BEFORE processing
    this.importedFiles.add(resolvedPath);

    // Check if file exists
    if (!fs.existsSync(resolvedPath)) {
      // Remove from imported files if file doesn't exist
      this.importedFiles.delete(resolvedPath);
      throw new RuntimeError(
        `Import error: File not found: ${importPath} (resolved to: ${resolvedPath})`,
        node.position?.line,
        node.position?.column
      );
    }

    try {

      logger.debug(`Importing file: ${resolvedPath}`);

      // Read file content
      const content = fs.readFileSync(resolvedPath, 'utf-8');

      // Tokenize the imported file
      const lexer = new Lexer(content);
      const tokens = lexer.tokenize();

      // Parse the imported file
      const parser = new Parser(tokens);
      const program = parser.parse();

      // Save current file path
      const previousFilePath = this.currentFilePath;

      // Update current file path for nested imports
      this.currentFilePath = resolvedPath;

      // Execute the imported file in the current environment (shared scope)
      for (const statement of program.body) {
        await this.evaluateStatement(statement, env);
      }

      // Restore previous file path
      this.currentFilePath = previousFilePath;

      logger.debug(`Successfully imported: ${resolvedPath}`);
      return makeNull();
    } catch (error) {
      // Remove from imported files if import failed
      this.importedFiles.delete(resolvedPath);

      if (error instanceof RuntimeError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new RuntimeError(
        `Import error: ${errorMessage}`,
        node.position?.line,
        node.position?.column
      );
    }
  }

  /**
   * Evaluate a send command
   */
  private async evaluateSendCommand(node: SendCommand, env: Environment): Promise<RuntimeValue> {
    const target = await this.evaluateExpression(node.target, env);
    const message = await this.evaluateExpression(node.message, env);

    try {
      return await send(target, message);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new RuntimeError(
        errorMessage,
        node.position?.line,
        node.position?.column
      );
    }
  }

  /**
   * Evaluate a reply command
   */
  private async evaluateReplyCommand(node: ReplyCommand, env: Environment): Promise<RuntimeValue> {
    const target = await this.evaluateExpression(node.target, env);
    const message = await this.evaluateExpression(node.message, env);

    try {
      return await reply(target, message);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new RuntimeError(
        errorMessage,
        node.position?.line,
        node.position?.column
      );
    }
  }

  /**
   * Evaluate a reply with command (Natural Language)
   */
  private async evaluateReplyWithCommand(node: ReplyWithCommand, env: Environment): Promise<RuntimeValue> {
    const target = env.lookup('__context_message');
    if (!target) {
      throw new RuntimeError("Cannot 'reply with' outside of a message context", node.position?.line, node.position?.column);
    }
    const message = await this.evaluateExpression(node.message, env);

    try {
      return await reply(target, message);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new RuntimeError(
        errorMessage,
        node.position?.line,
        node.position?.column
      );
    }
  }

  /**
   * Evaluate a reply with embed command (Natural Language)
   */
  private async evaluateReplyWithEmbedCommand(node: ReplyWithEmbedCommand, env: Environment): Promise<RuntimeValue> {
    const target = env.lookup('__context_message');
    if (!target) {
      throw new RuntimeError("Cannot 'reply with embed' outside of a message context", node.position?.line, node.position?.column);
    }
    const title = await this.evaluateExpression(node.title, env);
    const description = await this.evaluateExpression(node.description, env);

    try {
      return await replyWithEmbed(target, title, description);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new RuntimeError(
        errorMessage,
        node.position?.line,
        node.position?.column
      );
    }
  }

  /**
   * Evaluate a start bot command (Natural Language)
   */
  private async evaluateStartBotCommand(node: StartBotCommand, env: Environment): Promise<RuntimeValue> {
    const token = await this.evaluateExpression(node.token, env);
    const botStartFunc = env.lookup('bot_start');
    if (botStartFunc && botStartFunc.type === 'native-function') {
      try {
        const nativeFunc = botStartFunc as any; // Cast to bypass strict type checking of runtime value
        const result = await nativeFunc.call([token], env);
        // Add a slight delay to ensure bot connects properly
        await new Promise(resolve => setTimeout(resolve, 1000));
        return result;
      } catch (err: any) {
        throw new RuntimeError(`Failed to start bot: ${err.message}`, node.position?.line, node.position?.column);
      }
    }
    throw new RuntimeError("bot_start builtin function not found", node.position?.line, node.position?.column);
  }

  /**
   * Evaluate a load package command (Natural Language)
   */
  private async evaluateLoadPackageCommand(node: LoadPackageCommand, env: Environment): Promise<RuntimeValue> {
    const packageName = node.packageName;
    const alias = node.alias;

    if (node.packageManager === 'python') {
      try {
        await this.pythonBridge.importModule(packageName);
        const proxy = new PythonProxy(packageName, this.pythonBridge);
        this.pythonProxies.set(packageName, proxy);
        const proxyObject = proxy.createProxy();
        const pythonValue = makePython(packageName, proxyObject);
        env.declare(alias, pythonValue);
        return pythonValue;
      } catch (error) {
        throw new RuntimeError(`Failed to load Python package '${packageName}': ${(error as Error).message}`, node.position?.line, node.position?.column);
      }
    } else if (node.packageManager === 'npm') {
      const requireFunc = env.lookup('require');
      if (requireFunc && requireFunc.type === 'native-function') {
        try {
          const nativeFunc = requireFunc as any;
          const result = await nativeFunc.call([{ type: 'string', value: packageName }], env);
          env.declare(alias, result);
          return result;
        } catch (error) {
          throw new RuntimeError(`Failed to load NPM package '${packageName}': ${(error as Error).message}`, node.position?.line, node.position?.column);
        }
      }
      throw new RuntimeError("NPM require functionality is not available in this environment", node.position?.line, node.position?.column);
    }
    
    return { type: 'null', value: null } as any;
  }

  /**
   * Evaluate a when message command (Natural Language)
   */
  private async evaluateWhenMessageCommand(node: WhenMessageCommand, env: Environment): Promise<RuntimeValue> {
    // We register an event listener for 'messageCreate'
    const eventName = 'messageCreate';
    const conditionVal = await this.evaluateExpression(node.condition, env);
    if (conditionVal.type !== 'string') {
      throw new RuntimeError("When message condition must be a string", node.position?.line, node.position?.column);
    }
    const expectedText = (conditionVal as any).value;

    const handler = async (...eventArgs: unknown[]) => {
      const handlerEnv = env.extend();
      const runtimeArgs = this.eventManager.convertEventArgs(eventName, eventArgs);
      
      if (runtimeArgs.length > 0) {
        handlerEnv.define('__context_message', runtimeArgs[0]);
        // Also define 'message' for standard access
        handlerEnv.define('message', runtimeArgs[0]);
      }
      
      const messageObj = runtimeArgs[0] as any;
      if (messageObj && messageObj.type === 'object') {
        // check if message is from a bot
        const author = messageObj.properties.get('author');
        const isBot = author && author.type === 'object' && author.properties.get('bot')?.value === true;
        if (isBot) return; // skip bots

        const content = messageObj.properties.get('content');
        if (content && content.value === expectedText) {
          // execute body
          await this.evaluateBlockStatement(node.body, handlerEnv);
        }
      }
    };

    this.discordManager.registerEventHandler(eventName, handler);
    return { type: 'null', value: null } as any;
  }

  /**
   * Evaluate a when command used command (Natural Language Slash Commands)
   */
  private async evaluateWhenCommandUsedCommand(node: WhenCommandUsedCommand, env: Environment): Promise<RuntimeValue> {
    const eventName = 'interactionCreate';
    const commandNameVal = await this.evaluateExpression(node.commandName, env);
    if (commandNameVal.type !== 'string') {
      throw new RuntimeError("Command name must be a string", node.position?.line, node.position?.column);
    }
    const expectedCommand = (commandNameVal as any).value;

    const handler = async (...eventArgs: unknown[]) => {
      const handlerEnv = env.extend();
      const runtimeArgs = this.eventManager.convertEventArgs(eventName, eventArgs);
      
      if (runtimeArgs.length > 0) {
        const interactionObj = runtimeArgs[0] as any;
        
        // Ensure it's a command interaction
        const isCommand = interactionObj.properties?.get('isCommand');
        if (isCommand && isCommand.type === 'native-function') {
          // Native checking is complex in this runtime, so let's rely on the commandName property
          const cmdNameProp = interactionObj.properties.get('commandName');
          if (cmdNameProp && cmdNameProp.value === expectedCommand) {
            handlerEnv.define('__context_message', interactionObj); // use interaction as reply target
            handlerEnv.define('interaction', interactionObj);
            await this.evaluateBlockStatement(node.body, handlerEnv);
          }
        } else {
          // Fallback if isCommand isn't wrapped perfectly
          const cmdNameProp = interactionObj.properties?.get('commandName');
          if (cmdNameProp && cmdNameProp.value === expectedCommand) {
            handlerEnv.define('__context_message', interactionObj);
            handlerEnv.define('interaction', interactionObj);
            await this.evaluateBlockStatement(node.body, handlerEnv);
          }
        }
      }
    };

    this.discordManager.registerEventHandler(eventName, handler);
    return { type: 'null', value: null } as any;
  }

  /**
   * Evaluate a when bot starts command
   */
  private async evaluateWhenBotStartsCommand(node: WhenBotStartsCommand, env: Environment): Promise<RuntimeValue> {
    const handler = async () => {
      const handlerEnv = env.extend();
      await this.evaluateBlockStatement(node.body, handlerEnv);
    };
    this.discordManager.registerEventHandler('ready', handler);
    return { type: 'null', value: null } as any;
  }

  /**
   * Evaluate a when user joins server command
   */
  private async evaluateWhenUserJoinsCommand(node: WhenUserJoinsCommand, env: Environment): Promise<RuntimeValue> {
    const eventName = 'guildMemberAdd';
    const handler = async (...eventArgs: unknown[]) => {
      const handlerEnv = env.extend();
      const runtimeArgs = this.eventManager.convertEventArgs(eventName, eventArgs);
      if (runtimeArgs.length > 0) {
        handlerEnv.declare('user', runtimeArgs[0]);
        handlerEnv.declare('member', runtimeArgs[0]);
      }
      await this.evaluateBlockStatement(node.body, handlerEnv);
    };
    this.discordManager.registerEventHandler(eventName, handler);
    return { type: 'null', value: null } as any;
  }

  /**
   * Evaluate a when message starts with command
   */
  private async evaluateWhenMessageStartsWithCommand(node: WhenMessageStartsWithCommand, env: Environment): Promise<RuntimeValue> {
    const eventName = 'messageCreate';
    const conditionVal = await this.evaluateExpression(node.condition, env);
    if (conditionVal.type !== 'string') {
      throw new RuntimeError("When message condition must be a string", node.position?.line, node.position?.column);
    }
    const expectedPrefix = (conditionVal as any).value;

    const handler = async (...eventArgs: unknown[]) => {
      const handlerEnv = env.extend();
      const runtimeArgs = this.eventManager.convertEventArgs(eventName, eventArgs);
      
      if (runtimeArgs.length > 0) {
        handlerEnv.define('__context_message', runtimeArgs[0]);
        handlerEnv.define('message', runtimeArgs[0]);
      }
      
      const messageObj = runtimeArgs[0] as any;
      if (messageObj && messageObj.type === 'object') {
        const author = messageObj.properties.get('author');
        const isBot = author && author.type === 'object' && author.properties.get('bot')?.value === true;
        if (isBot) return;

        const content = messageObj.properties.get('content');
        if (content && typeof content.value === 'string' && content.value.startsWith(expectedPrefix)) {
          await this.evaluateBlockStatement(node.body, handlerEnv);
        }
      }
    };

    this.discordManager.registerEventHandler(eventName, handler);
    return { type: 'null', value: null } as any;
  }

  /**
   * Evaluate a when button is clicked command
   */
  private async evaluateWhenButtonClickedCommand(node: WhenButtonClickedCommand, env: Environment): Promise<RuntimeValue> {
    const eventName = 'interactionCreate';
    const buttonIdVal = await this.evaluateExpression(node.buttonId, env);
    if (buttonIdVal.type !== 'string') {
      throw new RuntimeError("Button id must be a string", node.position?.line, node.position?.column);
    }
    const expectedButtonId = (buttonIdVal as any).value;

    const handler = async (...eventArgs: unknown[]) => {
      const handlerEnv = env.extend();
      const runtimeArgs = this.eventManager.convertEventArgs(eventName, eventArgs);
      
      if (runtimeArgs.length > 0) {
        const interactionObj = runtimeArgs[0] as any;
        const customIdProp = interactionObj.properties?.get('customId');
        
        // Very basic way to detect button in this custom runtime
        if (customIdProp && customIdProp.value === expectedButtonId) {
          handlerEnv.define('__context_message', interactionObj);
          handlerEnv.define('interaction', interactionObj);
          await this.evaluateBlockStatement(node.body, handlerEnv);
        }
      }
    };

    this.discordManager.registerEventHandler(eventName, handler);
    return { type: 'null', value: null } as any;
  }

  /**
   * Evaluate a send to command
   */
  private async evaluateSendToCommand(node: SendToCommand, env: Environment): Promise<RuntimeValue> {
    const target = await this.evaluateExpression(node.target, env);
    const message = await this.evaluateExpression(node.message, env);
    try {
      return await send(target, message);
    } catch (error) {
      throw new RuntimeError(`Failed to send message: ${(error as Error).message}`, node.position?.line, node.position?.column);
    }
  }

  /**
   * Evaluate a react with command
   */
  private async evaluateReactWithCommand(node: ReactWithCommand, env: Environment): Promise<RuntimeValue> {
    const target = env.lookup('__context_message');
    if (!target) {
      throw new RuntimeError("Cannot 'react with' outside of a message context", node.position?.line, node.position?.column);
    }
    const emoji = await this.evaluateExpression(node.emoji, env);
    try {
      return await react(target, emoji);
    } catch (error) {
      throw new RuntimeError(`Failed to react: ${(error as Error).message}`, node.position?.line, node.position?.column);
    }
  }

  /**
   * Evaluate a set variable command
   */
  private async evaluateSetVariableCommand(node: SetVariableCommand, env: Environment): Promise<RuntimeValue> {
    const value = await this.evaluateExpression(node.value, env);
    // declare acts like let/var, we might need a fallback to assign if it exists, or just declare.
    env.declare(node.name, value);
    return value;
  }

  /**
   * Helper function to extract Discord.js structures from RuntimeValues
   */
  private extractDiscordObject(val: RuntimeValue): any {
    if (!val || val.type !== 'object') return null;
    const rawProp = (val as any).properties?.get('__raw');
    if (rawProp) return (rawProp as any).__rawValue;
    return val;
  }

  /**
   * Evaluate a ban command
   */
  private async evaluateBanCommand(node: BanCommand, env: Environment): Promise<RuntimeValue> {
    const user = await this.evaluateExpression(node.user, env);
    let reasonText = "No reason provided";
    if (node.reason) {
      const reasonVal = await this.evaluateExpression(node.reason, env);
      reasonText = (reasonVal as any).value?.toString() || reasonText;
    }

    const contextMsgValue = env.lookup('__context_message');
    if (!contextMsgValue) throw new RuntimeError("Cannot ban outside of a server context", node.position?.line, node.position?.column);
    
    const contextMsg = this.extractDiscordObject(contextMsgValue);
    if (!contextMsg || !contextMsg.guild) throw new RuntimeError("Cannot find guild to ban user", node.position?.line, node.position?.column);

    const targetNameOrId = (user as any).value?.toString();
    try {
      // Very basic lookup
      let member = contextMsg.guild.members.cache.find((m: any) => m.user.username === targetNameOrId || m.id === targetNameOrId);
      if (!member) {
        // Try fetching
        const members = await contextMsg.guild.members.fetch({ query: targetNameOrId, limit: 1 });
        member = members.first();
      }

      if (!member) throw new Error("User not found");
      await member.ban({ reason: reasonText });
      return { type: 'null', value: null } as any;
    } catch (err: any) {
      throw new RuntimeError(`Failed to ban user: ${err.message}`, node.position?.line, node.position?.column);
    }
  }

  /**
   * Evaluate a kick command
   */
  private async evaluateKickCommand(node: KickCommand, env: Environment): Promise<RuntimeValue> {
    const user = await this.evaluateExpression(node.user, env);
    let reasonText = "No reason provided";
    if (node.reason) {
      const reasonVal = await this.evaluateExpression(node.reason, env);
      reasonText = (reasonVal as any).value?.toString() || reasonText;
    }

    const contextMsgValue = env.lookup('__context_message');
    if (!contextMsgValue) throw new RuntimeError("Cannot kick outside of a server context", node.position?.line, node.position?.column);
    
    const contextMsg = this.extractDiscordObject(contextMsgValue);
    if (!contextMsg || !contextMsg.guild) throw new RuntimeError("Cannot find guild to kick user", node.position?.line, node.position?.column);

    const targetNameOrId = (user as any).value?.toString();
    try {
      let member = contextMsg.guild.members.cache.find((m: any) => m.user.username === targetNameOrId || m.id === targetNameOrId);
      if (!member) {
        const members = await contextMsg.guild.members.fetch({ query: targetNameOrId, limit: 1 });
        member = members.first();
      }

      if (!member) throw new Error("User not found");
      await member.kick(reasonText);
      return { type: 'null', value: null } as any;
    } catch (err: any) {
      throw new RuntimeError(`Failed to kick user: ${err.message}`, node.position?.line, node.position?.column);
    }
  }

  /**
   * Evaluate a timeout command
   */
  private async evaluateTimeoutCommand(node: TimeoutCommand, env: Environment): Promise<RuntimeValue> {
    const user = await this.evaluateExpression(node.user, env);
    const duration = await this.evaluateExpression(node.duration, env);
    
    if (duration.type !== 'number') {
      throw new RuntimeError("Timeout duration must be a number (minutes)", node.position?.line, node.position?.column);
    }
    const ms = (duration as any).value * 60 * 1000;

    const contextMsgValue = env.lookup('__context_message');
    const contextMsg = this.extractDiscordObject(contextMsgValue);
    if (!contextMsg || !contextMsg.guild) throw new RuntimeError("Cannot find guild to timeout user", node.position?.line, node.position?.column);

    const targetNameOrId = (user as any).value?.toString();
    try {
      let member = contextMsg.guild.members.cache.find((m: any) => m.user.username === targetNameOrId || m.id === targetNameOrId);
      if (!member) {
        const members = await contextMsg.guild.members.fetch({ query: targetNameOrId, limit: 1 });
        member = members.first();
      }

      if (!member) throw new Error("User not found");
      await member.timeout(ms, "Timed out via EzLang");
      return { type: 'null', value: null } as any;
    } catch (err: any) {
      throw new RuntimeError(`Failed to timeout user: ${err.message}`, node.position?.line, node.position?.column);
    }
  }

  /**
   * Evaluate add role command
   */
  private async evaluateAddRoleCommand(node: AddRoleCommand, env: Environment): Promise<RuntimeValue> {
    const roleName = await this.evaluateExpression(node.role, env);
    const user = await this.evaluateExpression(node.user, env);

    const contextMsgValue = env.lookup('__context_message');
    const contextMsg = this.extractDiscordObject(contextMsgValue);
    if (!contextMsg || !contextMsg.guild) throw new RuntimeError("Cannot manage roles outside of a server", node.position?.line, node.position?.column);

    try {
      const roleStr = (roleName as any).value?.toString();
      const userStr = (user as any).value?.toString();
      
      const roleObj = contextMsg.guild.roles.cache.find((r: any) => r.name === roleStr || r.id === roleStr);
      if (!roleObj) throw new Error("Role not found");

      let member = contextMsg.guild.members.cache.find((m: any) => m.user.username === userStr || m.id === userStr);
      if (!member) throw new Error("User not found");

      await member.roles.add(roleObj);
      return { type: 'null', value: null } as any;
    } catch (err: any) {
      throw new RuntimeError(`Failed to add role: ${err.message}`, node.position?.line, node.position?.column);
    }
  }

  /**
   * Evaluate remove role command
   */
  private async evaluateRemoveRoleCommand(node: RemoveRoleCommand, env: Environment): Promise<RuntimeValue> {
    const roleName = await this.evaluateExpression(node.role, env);
    const user = await this.evaluateExpression(node.user, env);

    const contextMsgValue = env.lookup('__context_message');
    const contextMsg = this.extractDiscordObject(contextMsgValue);
    if (!contextMsg || !contextMsg.guild) throw new RuntimeError("Cannot manage roles outside of a server", node.position?.line, node.position?.column);

    try {
      const roleStr = (roleName as any).value?.toString();
      const userStr = (user as any).value?.toString();
      
      const roleObj = contextMsg.guild.roles.cache.find((r: any) => r.name === roleStr || r.id === roleStr);
      if (!roleObj) throw new Error("Role not found");

      let member = contextMsg.guild.members.cache.find((m: any) => m.user.username === userStr || m.id === userStr);
      if (!member) throw new Error("User not found");

      await member.roles.remove(roleObj);
      return { type: 'null', value: null } as any;
    } catch (err: any) {
      throw new RuntimeError(`Failed to remove role: ${err.message}`, node.position?.line, node.position?.column);
    }
  }

  /**
   * Evaluate create thread command
   */
  private async evaluateCreateThreadCommand(node: CreateThreadCommand, env: Environment): Promise<RuntimeValue> {
    const threadName = await this.evaluateExpression(node.name, env);
    
    const contextMsgValue = env.lookup('__context_message');
    const contextMsg = this.extractDiscordObject(contextMsgValue);
    if (!contextMsg || !contextMsg.channel) throw new RuntimeError("Cannot create thread outside of a channel context", node.position?.line, node.position?.column);

    try {
      if (typeof contextMsg.startThread === 'function') {
        // Message thread
        await contextMsg.startThread({
          name: (threadName as any).value.toString(),
          autoArchiveDuration: 60,
        });
      } else if (typeof contextMsg.channel.threads?.create === 'function') {
        // Channel thread
        await contextMsg.channel.threads.create({
          name: (threadName as any).value.toString(),
          autoArchiveDuration: 60,
        });
      } else {
        throw new Error("Target does not support thread creation");
      }
      return { type: 'null', value: null } as any;
    } catch (err: any) {
      throw new RuntimeError(`Failed to create thread: ${err.message}`, node.position?.line, node.position?.column);
    }
  }

  /**
   * Evaluate join voice command
   */
  private async evaluateJoinVoiceCommand(node: JoinVoiceCommand, env: Environment): Promise<RuntimeValue> {
    const channelValue = await this.evaluateExpression(node.channel, env);
    
    const contextMsgValue = env.lookup('__context_message');
    const contextMsg = this.extractDiscordObject(contextMsgValue);
    if (!contextMsg || !contextMsg.guild) throw new RuntimeError("Cannot join voice outside of a server", node.position?.line, node.position?.column);

    try {
      const channelStr = (channelValue as any).value?.toString();
      const channel = contextMsg.guild.channels.cache.find((c: any) => (c.name === channelStr || c.id === channelStr) && c.isVoiceBased());
      if (!channel) throw new Error("Voice channel not found");

      // Attempt to require discordjs/voice if installed
      let joinVoiceChannel;
      try {
        const voicePkg = require('@discordjs/voice');
        joinVoiceChannel = voicePkg.joinVoiceChannel;
      } catch (e) {
        throw new Error("Voice dependencies are not installed. Run: npm install @discordjs/voice libsodium-wrappers ffmpeg-static");
      }

      joinVoiceChannel({
        channelId: channel.id,
        guildId: contextMsg.guild.id,
        adapterCreator: contextMsg.guild.voiceAdapterCreator,
      });

      return { type: 'null', value: null } as any;
    } catch (err: any) {
      throw new RuntimeError(`Failed to join voice: ${err.message}`, node.position?.line, node.position?.column);
    }
  }

  /**
   * Evaluate play audio command
   */
  private async evaluatePlayAudioCommand(node: PlayAudioCommand, env: Environment): Promise<RuntimeValue> {
    const fileValue = await this.evaluateExpression(node.file, env);
    
    const contextMsgValue = env.lookup('__context_message');
    const contextMsg = this.extractDiscordObject(contextMsgValue);
    if (!contextMsg || !contextMsg.guild) throw new RuntimeError("Cannot play audio outside of a server", node.position?.line, node.position?.column);

    try {
      let voicePkg;
      try {
        voicePkg = require('@discordjs/voice');
      } catch (e) {
        throw new Error("Voice dependencies are not installed. Run: npm install @discordjs/voice libsodium-wrappers ffmpeg-static");
      }

      const connection = voicePkg.getVoiceConnection(contextMsg.guild.id);
      if (!connection) throw new Error("Bot is not in a voice channel. Use 'join voice channel' first.");

      const player = voicePkg.createAudioPlayer();
      const resource = voicePkg.createAudioResource((fileValue as any).value.toString());

      player.play(resource);
      connection.subscribe(player);

      return { type: 'null', value: null } as any;
    } catch (err: any) {
      throw new RuntimeError(`Failed to play audio: ${err.message}`, node.position?.line, node.position?.column);
    }
  }

  /**
   * Evaluate a react command
   */
  private async evaluateReactCommand(node: ReactCommand, env: Environment): Promise<RuntimeValue> {
    const target = await this.evaluateExpression(node.target, env);
    const emoji = await this.evaluateExpression(node.emoji, env);

    try {
      return await react(target, emoji);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new RuntimeError(
        errorMessage,
        node.position?.line,
        node.position?.column
      );
    }
  }
}

// Export the main function to create and run the runtime
export async function executeProgram(program: Program): Promise<void> {
  const runtime = new Runtime(program);
  await runtime.execute();
}
