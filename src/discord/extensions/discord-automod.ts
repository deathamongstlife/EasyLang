/**
 * AutoMod System for EasyLang
 * Complete AutoMod rule management for content moderation
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
  isBoolean,
  isObject,
  isArray,
} from '../../core/runtime/values';
import { RuntimeError, TypeError } from '../../utils/errors';
import {
  Guild,
  AutoModerationRule,
  AutoModerationRuleTriggerType,
  AutoModerationRuleEventType,
  AutoModerationActionType,
  AutoModerationRuleKeywordPresetType,
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
 * Convert AutoMod rule to RuntimeValue
 */
function convertAutoModRuleToRuntime(rule: AutoModerationRule): RuntimeValue {
  const properties = new Map<string, RuntimeValue>();
  properties.set('__raw', { __rawValue: rule } as any);
  properties.set('id', makeString(rule.id));
  properties.set('name', makeString(rule.name));
  properties.set('enabled', makeBoolean(rule.enabled));
  properties.set('event_type', makeNumber(rule.eventType));
  properties.set('trigger_type', makeNumber(rule.triggerType));
  properties.set('creator_id', makeString(rule.creatorId));

  // Exempt roles
  if (rule.exemptRoles.size > 0) {
    const exemptRoles = Array.from(rule.exemptRoles.values()).map(role => makeString(typeof role === 'string' ? role : role.id));
    properties.set('exempt_roles', makeArray(exemptRoles));
  }

  // Exempt channels
  if (rule.exemptChannels.size > 0) {
    const exemptChannels = Array.from(rule.exemptChannels.values()).map(channel => makeString(typeof channel === 'string' ? channel : channel.id));
    properties.set('exempt_channels', makeArray(exemptChannels));
  }

  return makeObject(properties);
}

// ==================== AUTOMOD RULE FUNCTIONS ====================

/**
 * create_automod_rule(guild, options)
 * Create an AutoMod rule
 * options = {
 *   name: string,
 *   event_type: string ("MESSAGE_SEND"),
 *   trigger_type: string ("KEYWORD" | "SPAM" | "KEYWORD_PRESET" | "MENTION_SPAM"),
 *   trigger_metadata: object,
 *   actions: array,
 *   enabled: boolean,
 *   exempt_roles: array of role IDs,
 *   exempt_channels: array of channel IDs,
 *   reason: string
 * }
 * Returns: rule object
 */
export const createAutoModRule = makeNativeFunction('create_automod_rule', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`create_automod_rule() expects 2 arguments (guild, options), got ${args.length}`);
  }

  const guild = getRawValue(args[0]) as Guild;
  if (!guild || !guild.autoModerationRules) {
    throw new TypeError('First argument must be a Guild object');
  }

  if (!isObject(args[1])) {
    throw new TypeError('Second argument must be an options object');
  }

  const options = args[1];

  // Extract name (required)
  const nameProp = options.properties.get('name');
  if (!nameProp || !isString(nameProp)) {
    throw new RuntimeError('name is required and must be a string');
  }
  const name = nameProp.value;

  // Extract event type (required)
  const eventTypeProp = options.properties.get('event_type');
  if (!eventTypeProp || !isString(eventTypeProp)) {
    throw new RuntimeError('event_type is required and must be a string');
  }
  const eventType = AutoModerationRuleEventType.MessageSend; // Only option currently

  // Extract trigger type (required)
  const triggerTypeProp = options.properties.get('trigger_type');
  if (!triggerTypeProp || !isString(triggerTypeProp)) {
    throw new RuntimeError('trigger_type is required and must be a string');
  }
  const triggerTypeStr = triggerTypeProp.value.toUpperCase();

  const triggerTypeMap: { [key: string]: AutoModerationRuleTriggerType } = {
    KEYWORD: AutoModerationRuleTriggerType.Keyword,
    SPAM: AutoModerationRuleTriggerType.Spam,
    KEYWORD_PRESET: AutoModerationRuleTriggerType.KeywordPreset,
    MENTION_SPAM: AutoModerationRuleTriggerType.MentionSpam,
  };

  const triggerType = triggerTypeMap[triggerTypeStr];
  if (triggerType === undefined) {
    throw new RuntimeError(`Invalid trigger_type: ${triggerTypeStr}. Must be KEYWORD, SPAM, KEYWORD_PRESET, or MENTION_SPAM`);
  }

  // Extract trigger metadata
  const triggerMetadata: any = {};
  const metadataProp = options.properties.get('trigger_metadata');
  if (metadataProp && isObject(metadataProp)) {
    const metadata = metadataProp;

    // Keyword filter
    const keywordFilterProp = metadata.properties.get('keyword_filter');
    if (keywordFilterProp && isArray(keywordFilterProp)) {
      triggerMetadata.keywordFilter = keywordFilterProp.elements
        .filter(isString)
        .map(s => s.value);
    }

    // Regex patterns
    const regexPatternsProp = metadata.properties.get('regex_patterns');
    if (regexPatternsProp && isArray(regexPatternsProp)) {
      triggerMetadata.regexPatterns = regexPatternsProp.elements
        .filter(isString)
        .map(s => s.value);
    }

    // Presets
    const presetsProp = metadata.properties.get('presets');
    if (presetsProp && isArray(presetsProp)) {
      const presetMap: { [key: string]: AutoModerationRuleKeywordPresetType } = {
        PROFANITY: AutoModerationRuleKeywordPresetType.Profanity,
        SEXUAL_CONTENT: AutoModerationRuleKeywordPresetType.SexualContent,
        SLURS: AutoModerationRuleKeywordPresetType.Slurs,
      };
      triggerMetadata.presets = presetsProp.elements
        .filter(isString)
        .map(s => presetMap[s.value.toUpperCase()])
        .filter(p => p !== undefined);
    }

    // Mention total limit
    const mentionLimitProp = metadata.properties.get('mention_total_limit');
    if (mentionLimitProp && isNumber(mentionLimitProp)) {
      triggerMetadata.mentionTotalLimit = mentionLimitProp.value;
    }
  }

  // Extract actions (required)
  const actionsProp = options.properties.get('actions');
  if (!actionsProp || !isArray(actionsProp)) {
    throw new RuntimeError('actions is required and must be an array');
  }

  const actions = actionsProp.elements.map(actionObj => {
    if (!isObject(actionObj)) {
      throw new TypeError('Each action must be an object');
    }

    const typeProp = actionObj.properties.get('type');
    if (!typeProp || !isString(typeProp)) {
      throw new RuntimeError('Action type is required and must be a string');
    }

    const typeStr = typeProp.value.toUpperCase();
    const actionTypeMap: { [key: string]: AutoModerationActionType } = {
      BLOCK_MESSAGE: AutoModerationActionType.BlockMessage,
      SEND_ALERT_MESSAGE: AutoModerationActionType.SendAlertMessage,
      TIMEOUT: AutoModerationActionType.Timeout,
    };

    const type = actionTypeMap[typeStr];
    if (type === undefined) {
      throw new RuntimeError(`Invalid action type: ${typeStr}`);
    }

    const action: any = { type };

    // Add metadata based on action type
    if (type === AutoModerationActionType.SendAlertMessage) {
      const channelIdProp = actionObj.properties.get('channel_id');
      if (channelIdProp && isString(channelIdProp)) {
        action.metadata = { channelId: channelIdProp.value };
      }
    } else if (type === AutoModerationActionType.Timeout) {
      const durationProp = actionObj.properties.get('duration_seconds');
      if (durationProp && isNumber(durationProp)) {
        action.metadata = { durationSeconds: durationProp.value };
      }
    }

    return action;
  });

  // Extract optional fields
  const enabled = options.properties.get('enabled');
  const enabledValue = enabled && isBoolean(enabled) ? enabled.value : true;

  const exemptRolesProp = options.properties.get('exempt_roles');
  const exemptRoles = exemptRolesProp && isArray(exemptRolesProp)
    ? exemptRolesProp.elements.filter(isString).map(s => s.value)
    : [];

  const exemptChannelsProp = options.properties.get('exempt_channels');
  const exemptChannels = exemptChannelsProp && isArray(exemptChannelsProp)
    ? exemptChannelsProp.elements.filter(isString).map(s => s.value)
    : [];

  const reasonProp = options.properties.get('reason');
  const reason = reasonProp && isString(reasonProp) ? reasonProp.value : undefined;

  try {
    const rule = await guild.autoModerationRules.create({
      name,
      eventType,
      triggerType,
      triggerMetadata,
      actions,
      enabled: enabledValue,
      exemptRoles,
      exemptChannels,
      reason,
    });

    return convertAutoModRuleToRuntime(rule);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to create AutoMod rule: ${errorMsg}`);
  }
});

/**
 * edit_automod_rule(guild, rule_id, options)
 * Edit an AutoMod rule
 * Returns: updated rule object
 */
export const editAutoModRule = makeNativeFunction('edit_automod_rule', async (args: RuntimeValue[]) => {
  if (args.length !== 3) {
    throw new RuntimeError(`edit_automod_rule() expects 3 arguments (guild, rule_id, options), got ${args.length}`);
  }

  const guild = getRawValue(args[0]) as Guild;
  if (!guild || !guild.autoModerationRules) {
    throw new TypeError('First argument must be a Guild object');
  }

  if (!isString(args[1])) {
    throw new TypeError('rule_id must be a string');
  }
  const ruleId = args[1].value;

  if (!isObject(args[2])) {
    throw new TypeError('Third argument must be an options object');
  }
  const options = args[2];

  try {
    const rule = await guild.autoModerationRules.fetch(ruleId);

    const editOptions: any = {};

    // Name
    const nameProp = options.properties.get('name');
    if (nameProp && isString(nameProp)) {
      editOptions.name = nameProp.value;
    }

    // Enabled
    const enabledProp = options.properties.get('enabled');
    if (enabledProp && isBoolean(enabledProp)) {
      editOptions.enabled = enabledProp.value;
    }

    // Actions
    const actionsProp = options.properties.get('actions');
    if (actionsProp && isArray(actionsProp)) {
      editOptions.actions = actionsProp.elements.map(actionObj => {
        if (!isObject(actionObj)) return null;

        const typeProp = actionObj.properties.get('type');
        if (!typeProp || !isString(typeProp)) return null;

        const typeStr = typeProp.value.toUpperCase();
        const actionTypeMap: { [key: string]: AutoModerationActionType } = {
          BLOCK_MESSAGE: AutoModerationActionType.BlockMessage,
          SEND_ALERT_MESSAGE: AutoModerationActionType.SendAlertMessage,
          TIMEOUT: AutoModerationActionType.Timeout,
        };

        const type = actionTypeMap[typeStr];
        if (type === undefined) return null;

        return { type };
      }).filter(a => a !== null);
    }

    // Exempt roles
    const exemptRolesProp = options.properties.get('exempt_roles');
    if (exemptRolesProp && isArray(exemptRolesProp)) {
      editOptions.exemptRoles = exemptRolesProp.elements
        .filter(isString)
        .map(s => s.value);
    }

    // Exempt channels
    const exemptChannelsProp = options.properties.get('exempt_channels');
    if (exemptChannelsProp && isArray(exemptChannelsProp)) {
      editOptions.exemptChannels = exemptChannelsProp.elements
        .filter(isString)
        .map(s => s.value);
    }

    // Reason
    const reasonProp = options.properties.get('reason');
    if (reasonProp && isString(reasonProp)) {
      editOptions.reason = reasonProp.value;
    }

    const updatedRule = await rule.edit(editOptions);
    return convertAutoModRuleToRuntime(updatedRule);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to edit AutoMod rule: ${errorMsg}`);
  }
});

/**
 * delete_automod_rule(guild, rule_id, reason?)
 * Delete an AutoMod rule
 * Returns: boolean
 */
export const deleteAutoModRule = makeNativeFunction('delete_automod_rule', async (args: RuntimeValue[]) => {
  if (args.length < 2) {
    throw new RuntimeError(`delete_automod_rule() expects at least 2 arguments (guild, rule_id), got ${args.length}`);
  }

  const guild = getRawValue(args[0]) as Guild;
  if (!guild || !guild.autoModerationRules) {
    throw new TypeError('First argument must be a Guild object');
  }

  if (!isString(args[1])) {
    throw new TypeError('rule_id must be a string');
  }
  const ruleId = args[1].value;

  const reason = args.length >= 3 && isString(args[2]) ? args[2].value : undefined;

  try {
    await guild.autoModerationRules.delete(ruleId, reason);
    return makeBoolean(true);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to delete AutoMod rule: ${errorMsg}`);
  }
});

/**
 * fetch_automod_rules(guild)
 * Fetch all AutoMod rules in a guild
 * Returns: array of rule objects
 */
export const fetchAutoModRules = makeNativeFunction('fetch_automod_rules', async (args: RuntimeValue[]) => {
  if (args.length !== 1) {
    throw new RuntimeError(`fetch_automod_rules() expects 1 argument (guild), got ${args.length}`);
  }

  const guild = getRawValue(args[0]) as Guild;
  if (!guild || !guild.autoModerationRules) {
    throw new TypeError('Argument must be a Guild object');
  }

  try {
    const rules = await guild.autoModerationRules.fetch();
    const ruleArray = Array.from(rules.values()).map(rule => convertAutoModRuleToRuntime(rule));
    return makeArray(ruleArray);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to fetch AutoMod rules: ${errorMsg}`);
  }
});

/**
 * fetch_automod_rule(guild, rule_id)
 * Fetch a specific AutoMod rule
 * Returns: rule object
 */
export const fetchAutoModRule = makeNativeFunction('fetch_automod_rule', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`fetch_automod_rule() expects 2 arguments (guild, rule_id), got ${args.length}`);
  }

  const guild = getRawValue(args[0]) as Guild;
  if (!guild || !guild.autoModerationRules) {
    throw new TypeError('First argument must be a Guild object');
  }

  if (!isString(args[1])) {
    throw new TypeError('rule_id must be a string');
  }
  const ruleId = args[1].value;

  try {
    const rule = await guild.autoModerationRules.fetch(ruleId);
    return convertAutoModRuleToRuntime(rule);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to fetch AutoMod rule: ${errorMsg}`);
  }
});

/**
 * enable_automod_rule(guild, rule_id)
 * Enable an AutoMod rule
 * Returns: updated rule object
 */
export const enableAutoModRule = makeNativeFunction('enable_automod_rule', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`enable_automod_rule() expects 2 arguments (guild, rule_id), got ${args.length}`);
  }

  const guild = getRawValue(args[0]) as Guild;
  if (!guild || !guild.autoModerationRules) {
    throw new TypeError('First argument must be a Guild object');
  }

  if (!isString(args[1])) {
    throw new TypeError('rule_id must be a string');
  }
  const ruleId = args[1].value;

  try {
    const rule = await guild.autoModerationRules.fetch(ruleId);
    const updatedRule = await rule.edit({ enabled: true });
    return convertAutoModRuleToRuntime(updatedRule);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to enable AutoMod rule: ${errorMsg}`);
  }
});

/**
 * disable_automod_rule(guild, rule_id)
 * Disable an AutoMod rule
 * Returns: updated rule object
 */
export const disableAutoModRule = makeNativeFunction('disable_automod_rule', async (args: RuntimeValue[]) => {
  if (args.length !== 2) {
    throw new RuntimeError(`disable_automod_rule() expects 2 arguments (guild, rule_id), got ${args.length}`);
  }

  const guild = getRawValue(args[0]) as Guild;
  if (!guild || !guild.autoModerationRules) {
    throw new TypeError('First argument must be a Guild object');
  }

  if (!isString(args[1])) {
    throw new TypeError('rule_id must be a string');
  }
  const ruleId = args[1].value;

  try {
    const rule = await guild.autoModerationRules.fetch(ruleId);
    const updatedRule = await rule.edit({ enabled: false });
    return convertAutoModRuleToRuntime(updatedRule);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new RuntimeError(`Failed to disable AutoMod rule: ${errorMsg}`);
  }
});

// Export all AutoMod functions
export const autoModBuiltins = {
  create_automod_rule: createAutoModRule,
  edit_automod_rule: editAutoModRule,
  delete_automod_rule: deleteAutoModRule,
  fetch_automod_rules: fetchAutoModRules,
  fetch_automod_rule: fetchAutoModRule,
  enable_automod_rule: enableAutoModRule,
  disable_automod_rule: disableAutoModRule,
};
