/**
 * Audit Logs for EasyLang
 * Complete audit log system for tracking server changes
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
  isObject,
} from './values';
import { RuntimeError, TypeError } from '../utils/errors';
import {
  Guild,
  AuditLogEvent,
  GuildAuditLogsEntry,
} from 'discord.js';

/**
 * Extract raw Discord.js object from RuntimeValue
 */
function getRawValue(value: RuntimeValue): any {
  if (isObject(value)) {
    const rawProp = value.properties.get('__raw');
    if (rawProp && isObject(rawProp)) {
      return (rawProp as any).__rawValue;
    }
  }
  return null;
}

/**
 * Convert audit log entry to RuntimeValue
 */
function convertAuditLogEntryToRuntime(entry: GuildAuditLogsEntry): RuntimeValue {
  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: entry } as any);
  properties.set('id', makeString(entry.id));
  properties.set('action', makeNumber(entry.action));
  properties.set('action_type', makeString(entry.actionType));
  properties.set('target_type', makeString(entry.targetType));

  if (entry.targetId) {
    properties.set('target_id', makeString(entry.targetId));
  }

  if (entry.executorId) {
    properties.set('executor_id', makeString(entry.executorId));
  }

  if (entry.reason) {
    properties.set('reason', makeString(entry.reason));
  }

  properties.set('created_at', makeString(entry.createdAt.toISOString()));
  properties.set('created_timestamp', makeNumber(entry.createdTimestamp));

  // Changes
  if (entry.changes && entry.changes.length > 0) {
    const changes = entry.changes.map(change => {
      const changeProps = new Map<string, RuntimeValue>();
      changeProps.set('key', makeString(change.key));
      if (change.old !== undefined) {
        changeProps.set('old', makeString(String(change.old)));
      }
      if (change.new !== undefined) {
        changeProps.set('new', makeString(String(change.new)));
      }
      return makeObject(changeProps);
    });
    properties.set('changes', makeArray(changes));
  }

  return makeObject(properties);
}

// ==================== AUDIT LOG FUNCTIONS ====================

/**
 * fetch_audit_logs(guild, options?)
 * Fetch audit log entries
 * options = {
 *   limit: number (1-100, default 50),
 *   user_id: string,
 *   action_type: string,
 *   before: string (entry ID),
 *   after: string (entry ID)
 * }
 * Returns: array of audit log entries
 */
export const fetchAuditLogs = makeNativeFunction('fetch_audit_logs', async (args: RuntimeValue[]) => {
  if (args.length < 1) {
    throw new RuntimeError(`fetch_audit_logs() expects at least 1 argument (guild), got ${args.length}`);
  }

  const guild = getRawValue(args[0]) as Guild;
  if (!guild || !guild.fetchAuditLogs) {
    throw new TypeError('First argument must be a Guild object');
  }

  const fetchOptions: any = {};

  // Parse options if provided
  if (args.length >= 2 && isObject(args[1])) {
    const options = args[1];

    const limit = options.properties.get('limit');
    if (limit && isNumber(limit)) {
      fetchOptions.limit = Math.min(Math.max(limit.value, 1), 100);
    }

    const userId = options.properties.get('user_id');
    if (userId && isString(userId)) {
      fetchOptions.user = userId.value;
    }

    const actionType = options.properties.get('action_type');
    if (actionType && isString(actionType)) {
      // Map string to AuditLogEvent enum
      const actionMap: { [key: string]: AuditLogEvent } = {
        ALL: AuditLogEvent.All,
        GUILD_UPDATE: AuditLogEvent.GuildUpdate,
        CHANNEL_CREATE: AuditLogEvent.ChannelCreate,
        CHANNEL_UPDATE: AuditLogEvent.ChannelUpdate,
        CHANNEL_DELETE: AuditLogEvent.ChannelDelete,
        CHANNEL_OVERWRITE_CREATE: AuditLogEvent.ChannelOverwriteCreate,
        CHANNEL_OVERWRITE_UPDATE: AuditLogEvent.ChannelOverwriteUpdate,
        CHANNEL_OVERWRITE_DELETE: AuditLogEvent.ChannelOverwriteDelete,
        MEMBER_KICK: AuditLogEvent.MemberKick,
        MEMBER_PRUNE: AuditLogEvent.MemberPrune,
        MEMBER_BAN_ADD: AuditLogEvent.MemberBanAdd,
        MEMBER_BAN_REMOVE: AuditLogEvent.MemberBanRemove,
        MEMBER_UPDATE: AuditLogEvent.MemberUpdate,
        MEMBER_ROLE_UPDATE: AuditLogEvent.MemberRoleUpdate,
        ROLE_CREATE: AuditLogEvent.RoleCreate,
        ROLE_UPDATE: AuditLogEvent.RoleUpdate,
        ROLE_DELETE: AuditLogEvent.RoleDelete,
        INVITE_CREATE: AuditLogEvent.InviteCreate,
        INVITE_UPDATE: AuditLogEvent.InviteUpdate,
        INVITE_DELETE: AuditLogEvent.InviteDelete,
        WEBHOOK_CREATE: AuditLogEvent.WebhookCreate,
        WEBHOOK_UPDATE: AuditLogEvent.WebhookUpdate,
        WEBHOOK_DELETE: AuditLogEvent.WebhookDelete,
        EMOJI_CREATE: AuditLogEvent.EmojiCreate,
        EMOJI_UPDATE: AuditLogEvent.EmojiUpdate,
        EMOJI_DELETE: AuditLogEvent.EmojiDelete,
        MESSAGE_DELETE: AuditLogEvent.MessageDelete,
        MESSAGE_BULK_DELETE: AuditLogEvent.MessageBulkDelete,
        MESSAGE_PIN: AuditLogEvent.MessagePin,
        MESSAGE_UNPIN: AuditLogEvent.MessageUnpin,
      };

      const action = actionMap[actionType.value.toUpperCase()];
      if (action !== undefined) {
        fetchOptions.type = action;
      }
    }

    const before = options.properties.get('before');
    if (before && isString(before)) {
      fetchOptions.before = before.value;
    }

    const after = options.properties.get('after');
    if (after && isString(after)) {
      fetchOptions.after = after.value;
    }
  }

  try {
    const logs = await guild.fetchAuditLogs(fetchOptions);
    const entries = Array.from(logs.entries.values()).map(entry =>
      convertAuditLogEntryToRuntime(entry)
    );
    return makeArray(entries);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to fetch audit logs: ${errorMsg}`);
  }
});

/**
 * get_audit_log_entry(guild, entry_id)
 * Get specific audit log entry
 * Returns: audit log entry object
 */
export const getAuditLogEntry = makeNativeFunction('get_audit_log_entry', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`get_audit_log_entry() expects 2 arguments (guild, entry_id), got ${args.length}`);
  }

  const guild = getRawValue(args[0]) as Guild;
  if (!guild || !guild.fetchAuditLogs) {
    throw new TypeError('First argument must be a Guild object');
  }

  if (!isString(args[1])) {
    throw new TypeError('entry_id must be a string');
  }
  const entryId = args[1].value;

  try {
    const logs = await guild.fetchAuditLogs({ limit: 1 });
    const entry = logs.entries.get(entryId);

    if (!entry) {
      throw new RuntimeError(`Audit log entry not found: ${entryId}`);
    }

    return convertAuditLogEntryToRuntime(entry);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to get audit log entry: ${errorMsg}`);
  }
});

// Export all audit log functions
export const auditLogBuiltins = {
  fetch_audit_logs: fetchAuditLogs,
  get_audit_log_entry: getAuditLogEntry,
};
