/**
 * Runtime (Interpreter) for EzLang
 * Executes the AST produced by the parser
 */

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
  BinaryExpression,
  UnaryExpression,
  CallExpression,
  MemberExpression,
  Identifier,
  Literal,
  ArrayLiteral,
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
  makeFunction,
  makeReturn,
  isNumber,
  isString,
  isArray,
  isObject,
  isFunction,
  isNativeFunction,
  isReturn,
  isTruthy,
  valuesEqual,
  valueToString,
} from './values';
import { RuntimeError, TypeError, UndefinedFunctionError } from '../utils/errors';
import { logger } from '../utils/logger';

export class Runtime {
  private program: Program;
  private globalEnv: Environment;

  constructor(program: Program) {
    this.program = program;
    this.globalEnv = createGlobalEnvironment();
  }

  /**
   * Execute the program
   */
  async execute(): Promise<void> {
    logger.debug('Runtime: Starting execution');
    try {
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
}

// Export the main function to create and run the runtime
export async function executeProgram(program: Program): Promise<void> {
  const runtime = new Runtime(program);
  await runtime.execute();
}
