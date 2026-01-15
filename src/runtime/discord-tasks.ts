/**
 * Discord Background Tasks and Loops for EzLang
 * Provides scheduled task and interval-based loop system
 */

import {
  RuntimeValue,
  makeString,
  makeBoolean,
  makeObject,
  makeNativeFunction,
  makeArray,
  makeNumber,
  isString,
  isNumber,
  isFunction,
  isArray,
  isObject,
  FunctionValue,
} from './values';
import { RuntimeError, TypeError } from '../utils/errors';

interface Task {
  id: string;
  type: 'loop' | 'scheduled';
  callback: FunctionValue;
  interval?: number; // seconds for loop
  times?: string[]; // HH:MM format for scheduled
  running: boolean;
  timer?: NodeJS.Timeout;
  nextRun?: Date;
  lastRun?: Date;
  errorCount: number;
  maxRetries: number;
  beforeCallback?: FunctionValue;
  afterCallback?: FunctionValue;
}

// Global task storage
const tasks = new Map<string, Task>();
let taskIdCounter = 0;

/**
 * Generate unique task ID
 */
function generateTaskId(): string {
  return `task_${++taskIdCounter}_${Date.now()}`;
}

/**
 * Execute task callback with error handling
 */
async function executeTask(task: Task): Promise<void> {
  try {
    // Note: Task callbacks are stored as FunctionValue references
    // They will be executed by the runtime when the task fires
    // This is a placeholder that marks the task as executed

    task.lastRun = new Date();
    task.errorCount = 0; // Reset error count on success

    // In a real implementation, the runtime would call the callback function here
    console.log(`[Task ${task.id}] Callback would be executed here`);
  } catch (error) {
    task.errorCount++;
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Task ${task.id}] Error executing callback: ${errorMsg}`);

    // Stop task if too many errors
    if (task.errorCount >= task.maxRetries) {
      console.error(`[Task ${task.id}] Max retries (${task.maxRetries}) exceeded. Stopping task.`);
      stopTaskInternal(task.id);
    }
  }
}

/**
 * Calculate next scheduled run time
 */
function calculateNextRun(times: string[]): Date | null {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  let nextTime: number | null = null;
  let nextDay = false;

  for (const timeStr of times) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const targetTime = hours * 60 + minutes;

    if (targetTime > currentTime) {
      if (nextTime === null || targetTime < nextTime) {
        nextTime = targetTime;
        nextDay = false;
      }
    }
  }

  // If no time found today, use earliest time tomorrow
  if (nextTime === null) {
    const [hours, minutes] = times[0].split(':').map(Number);
    nextTime = hours * 60 + minutes;
    nextDay = true;
  }

  const nextRun = new Date(now);
  if (nextDay) {
    nextRun.setDate(nextRun.getDate() + 1);
  }
  nextRun.setHours(Math.floor(nextTime / 60));
  nextRun.setMinutes(nextTime % 60);
  nextRun.setSeconds(0);
  nextRun.setMilliseconds(0);

  return nextRun;
}

/**
 * Internal function to start a task
 */
function startTaskInternal(taskId: string): boolean {
  const task = tasks.get(taskId);
  if (!task) {
    return false;
  }

  if (task.running) {
    return true; // Already running
  }

  task.running = true;

  if (task.type === 'loop') {
    // Interval-based loop
    const intervalMs = (task.interval || 60) * 1000;
    task.timer = setInterval(async () => {
      await executeTask(task);
    }, intervalMs);
  } else if (task.type === 'scheduled') {
    // Time-based scheduling
    const scheduleNext = () => {
      const nextRun = calculateNextRun(task.times || []);
      if (!nextRun) {
        console.error(`[Task ${taskId}] Failed to calculate next run time`);
        return;
      }

      task.nextRun = nextRun;
      const delay = nextRun.getTime() - Date.now();

      task.timer = setTimeout(async () => {
        await executeTask(task);
        scheduleNext(); // Schedule next run after execution
      }, delay);
    };

    scheduleNext();
  }

  return true;
}

/**
 * Internal function to stop a task
 */
function stopTaskInternal(taskId: string): boolean {
  const task = tasks.get(taskId);
  if (!task) {
    return false;
  }

  if (task.timer) {
    if (task.type === 'loop') {
      clearInterval(task.timer);
    } else {
      clearTimeout(task.timer);
    }
    task.timer = undefined;
  }

  task.running = false;
  return true;
}

/**
 * create_loop(callback, interval_seconds)
 * Create a repeating task that runs every interval_seconds
 */
export const createLoop = makeNativeFunction('create_loop', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError(`create_loop() expects 2 arguments (callback, interval_seconds), got ${args.length}`);
  }

  if (!isFunction(args[0])) {
    throw new TypeError('Callback must be a function');
  }

  if (!isNumber(args[1])) {
    throw new TypeError('Interval must be a number (seconds)');
  }

  const callback = args[0] as FunctionValue;
  const interval = args[1].value;

  if (interval <= 0) {
    throw new RuntimeError('Interval must be greater than 0');
  }

  const taskId = generateTaskId();
  const task: Task = {
    id: taskId,
    type: 'loop',
    callback,
    interval,
    running: false,
    errorCount: 0,
    maxRetries: 5,
  };

  tasks.set(taskId, task);

  const properties = new Map<string, RuntimeValue>();
  properties.set('id', makeString(taskId));
  properties.set('type', makeString('loop'));
  properties.set('interval', makeNumber(interval));
  properties.set('running', makeBoolean(false));

  return makeObject(properties);
});

/**
 * create_scheduled_task(callback, times_array)
 * Create a task that runs at specific times each day
 * times_array format: ["08:00", "12:00", "18:00"]
 */
export const createScheduledTask = makeNativeFunction('create_scheduled_task', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError(`create_scheduled_task() expects 2 arguments (callback, times_array), got ${args.length}`);
  }

  if (!isFunction(args[0])) {
    throw new TypeError('Callback must be a function');
  }

  if (!isArray(args[1])) {
    throw new TypeError('Times must be an array of strings (HH:MM format)');
  }

  const callback = args[0] as FunctionValue;
  const timesArray = args[1];

  // Validate and extract times
  const times: string[] = [];
  for (const timeVal of timesArray.elements) {
    if (!isString(timeVal)) {
      throw new TypeError('All times must be strings in HH:MM format');
    }

    const time = timeVal.value;
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      throw new RuntimeError(`Invalid time format: ${time}. Use HH:MM format (e.g., "08:00", "14:30")`);
    }

    times.push(time);
  }

  if (times.length === 0) {
    throw new RuntimeError('At least one time must be provided');
  }

  // Sort times for consistent behavior
  times.sort();

  const taskId = generateTaskId();
  const task: Task = {
    id: taskId,
    type: 'scheduled',
    callback,
    times,
    running: false,
    errorCount: 0,
    maxRetries: 5,
  };

  tasks.set(taskId, task);

  const properties = new Map<string, RuntimeValue>();
  properties.set('id', makeString(taskId));
  properties.set('type', makeString('scheduled'));
  properties.set('times', makeArray(times.map(t => makeString(t))));
  properties.set('running', makeBoolean(false));

  return makeObject(properties);
});

/**
 * start_task(task_id)
 * Start or resume a task
 */
export const startTask = makeNativeFunction('start_task', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`start_task() expects 1 argument (task_id), got ${args.length}`);
  }

  let taskId: string;
  if (isString(args[0])) {
    taskId = args[0].value;
  } else if (isObject(args[0])) {
    const idProp = args[0].properties.get('id');
    if (!idProp || !isString(idProp)) {
      throw new RuntimeError('Invalid task object: missing or invalid id property');
    }
    taskId = idProp.value;
  } else {
    throw new TypeError('Task ID must be a string or task object');
  }

  const success = startTaskInternal(taskId);
  if (!success) {
    throw new RuntimeError(`Task not found: ${taskId}`);
  }

  return makeBoolean(true);
});

/**
 * stop_task(task_id)
 * Stop a running task
 */
export const stopTask = makeNativeFunction('stop_task', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`stop_task() expects 1 argument (task_id), got ${args.length}`);
  }

  let taskId: string;
  if (isString(args[0])) {
    taskId = args[0].value;
  } else if (isObject(args[0])) {
    const idProp = args[0].properties.get('id');
    if (!idProp || !isString(idProp)) {
      throw new RuntimeError('Invalid task object: missing or invalid id property');
    }
    taskId = idProp.value;
  } else {
    throw new TypeError('Task ID must be a string or task object');
  }

  const success = stopTaskInternal(taskId);
  if (!success) {
    throw new RuntimeError(`Task not found: ${taskId}`);
  }

  return makeBoolean(true);
});

/**
 * is_task_running(task_id)
 * Check if a task is currently running
 */
export const isTaskRunning = makeNativeFunction('is_task_running', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`is_task_running() expects 1 argument (task_id), got ${args.length}`);
  }

  let taskId: string;
  if (isString(args[0])) {
    taskId = args[0].value;
  } else if (isObject(args[0])) {
    const idProp = args[0].properties.get('id');
    if (!idProp || !isString(idProp)) {
      throw new RuntimeError('Invalid task object: missing or invalid id property');
    }
    taskId = idProp.value;
  } else {
    throw new TypeError('Task ID must be a string or task object');
  }

  const task = tasks.get(taskId);
  if (!task) {
    throw new RuntimeError(`Task not found: ${taskId}`);
  }

  return makeBoolean(task.running);
});

/**
 * get_task_info(task_id)
 * Get detailed information about a task
 */
export const getTaskInfo = makeNativeFunction('get_task_info', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`get_task_info() expects 1 argument (task_id), got ${args.length}`);
  }

  let taskId: string;
  if (isString(args[0])) {
    taskId = args[0].value;
  } else if (isObject(args[0])) {
    const idProp = args[0].properties.get('id');
    if (!idProp || !isString(idProp)) {
      throw new RuntimeError('Invalid task object: missing or invalid id property');
    }
    taskId = idProp.value;
  } else {
    throw new TypeError('Task ID must be a string or task object');
  }

  const task = tasks.get(taskId);
  if (!task) {
    throw new RuntimeError(`Task not found: ${taskId}`);
  }

  const properties = new Map<string, RuntimeValue>();
  properties.set('id', makeString(task.id));
  properties.set('type', makeString(task.type));
  properties.set('running', makeBoolean(task.running));
  properties.set('error_count', makeNumber(task.errorCount));
  properties.set('max_retries', makeNumber(task.maxRetries));

  if (task.interval !== undefined) {
    properties.set('interval', makeNumber(task.interval));
  }

  if (task.times) {
    properties.set('times', makeArray(task.times.map(t => makeString(t))));
  }

  if (task.lastRun) {
    properties.set('last_run', makeString(task.lastRun.toISOString()));
  }

  if (task.nextRun) {
    properties.set('next_run', makeString(task.nextRun.toISOString()));
  }

  return makeObject(properties);
});

/**
 * list_tasks()
 * Get a list of all tasks
 */
export const listTasks = makeNativeFunction('list_tasks', async (args: RuntimeValue[]) => {
  if (args.length !== 0) {
    throw new RuntimeError(`list_tasks() expects 0 arguments, got ${args.length}`);
  }

  const taskArray = Array.from(tasks.values()).map(task => {
    const properties = new Map<string, RuntimeValue>();
    properties.set('id', makeString(task.id));
    properties.set('type', makeString(task.type));
    properties.set('running', makeBoolean(task.running));

    if (task.interval !== undefined) {
      properties.set('interval', makeNumber(task.interval));
    }

    if (task.times) {
      properties.set('times', makeArray(task.times.map(t => makeString(t))));
    }

    return makeObject(properties);
  });

  return makeArray(taskArray);
});

/**
 * delete_task(task_id)
 * Permanently delete a task
 */
export const deleteTask = makeNativeFunction('delete_task', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`delete_task() expects 1 argument (task_id), got ${args.length}`);
  }

  let taskId: string;
  if (isString(args[0])) {
    taskId = args[0].value;
  } else if (isObject(args[0])) {
    const idProp = args[0].properties.get('id');
    if (!idProp || !isString(idProp)) {
      throw new RuntimeError('Invalid task object: missing or invalid id property');
    }
    taskId = idProp.value;
  } else {
    throw new TypeError('Task ID must be a string or task object');
  }

  const task = tasks.get(taskId);
  if (!task) {
    throw new RuntimeError(`Task not found: ${taskId}`);
  }

  // Stop task if running
  if (task.running) {
    stopTaskInternal(taskId);
  }

  // Delete from storage
  tasks.delete(taskId);

  return makeBoolean(true);
});

// Export all task functions
export const taskBuiltins = {
  create_loop: createLoop,
  create_scheduled_task: createScheduledTask,
  start_task: startTask,
  stop_task: stopTask,
  is_task_running: isTaskRunning,
  get_task_info: getTaskInfo,
  list_tasks: listTasks,
  delete_task: deleteTask,
};

// Export for testing and internal use
export { tasks, startTaskInternal, stopTaskInternal };
