# EasyLang 100% Discord API Parity - Implementation Plan

**Status**: In Progress
**Linked to**: GitHub Issue #11
**Start Date**: 2026-01-16
**Current Coverage**: 35-40%
**Target Coverage**: 100%

---

## Executive Summary

This document tracks the comprehensive implementation plan to achieve 100% Discord API feature parity for EasyLang. Based on the analysis in `DISCORD_API_COVERAGE_ANALYSIS.md`, we need to:

- Reorganize codebase for better maintainability
- Implement 60%+ missing Discord features
- Create comprehensive test coverage
- Maintain backward compatibility

**Estimated Timeline**: 24 weeks
**Estimated New Code**: 15,000-20,000 lines
**New Files**: ~160

---

## Phase 1: Codebase Reorganization (Week 1)

### Goal
Transform the current flat structure into a well-organized, modular architecture.

### Current Structure
```
src/
├── runtime/        # All runtime files mixed together
├── discord/        # Minimal Discord files
├── lexer/          # Language lexer
├── parser/         # Language parser
├── bridges/        # JS/Python interop
├── packages/       # Package management
└── utils/          # Utilities
```

### Target Structure
```
src/
├── core/                    # Core language features (NEW)
│   ├── lexer/              # Tokenization
│   ├── parser/             # AST generation
│   └── runtime/            # Interpreter
│       ├── index.ts
│       ├── environment.ts
│       ├── values.ts
│       └── builtins.ts
│
├── discord/                # Discord integration (REORGANIZED)
│   ├── api/                # Discord API wrappers
│   │   ├── client.ts       # Client management
│   │   ├── managers/       # Data managers (40 classes)
│   │   │   ├── guild-manager.ts
│   │   │   ├── channel-manager.ts
│   │   │   ├── message-manager.ts
│   │   │   ├── role-manager.ts
│   │   │   └── ...
│   │   ├── structures/     # Data structures (120+ classes)
│   │   │   ├── guild.ts
│   │   │   ├── channel.ts
│   │   │   ├── message.ts
│   │   │   ├── user.ts
│   │   │   └── ...
│   │   └── builders/       # Message builders (60+ classes)
│   │       ├── embed-builder.ts
│   │       ├── button-builder.ts
│   │       ├── modal-builder.ts
│   │       ├── select-menu-builder.ts
│   │       └── ...
│   │
│   ├── events/            # Event system
│   │   ├── index.ts       # Event manager
│   │   ├── converter.ts   # Event arg conversion
│   │   └── handlers.ts    # Event handlers
│   │
│   ├── commands/          # Slash commands & context menus
│   │   ├── index.ts       # Command manager
│   │   ├── slash.ts       # Slash command handling
│   │   ├── context.ts     # Context menu handling
│   │   └── autocomplete.ts # Autocomplete
│   │
│   ├── components/        # UI Components
│   │   ├── buttons.ts     # Button components
│   │   ├── selects.ts     # Select menus
│   │   ├── modals.ts      # Modal forms
│   │   └── views.ts       # View system
│   │
│   ├── voice/            # Voice & audio
│   │   ├── client.ts     # Voice client
│   │   ├── connection.ts # Voice connections
│   │   ├── audio.ts      # Audio player
│   │   └── effects.ts    # Voice effects
│   │
│   └── extensions/       # Advanced features
│       ├── automod.ts    # AutoMod rules
│       ├── audit.ts      # Audit logs
│       ├── threads.ts    # Thread management
│       ├── forums.ts     # Forum channels
│       ├── stages.ts     # Stage instances
│       ├── events.ts     # Scheduled events
│       ├── polls.ts      # Message polls
│       ├── stickers.ts   # Sticker management
│       ├── webhooks.ts   # Webhook operations
│       ├── templates.ts  # Guild templates
│       ├── invites.ts    # Invite management
│       └── monetization.ts # SKUs, entitlements
│
├── bridges/              # Interop (unchanged)
├── packages/             # Package management (unchanged)
└── utils/                # Shared utilities
```

### Migration Tasks

#### 1.1 Core Language Files
- [ ] Move `src/lexer/` → `src/core/lexer/`
- [ ] Move `src/parser/` → `src/core/parser/`
- [ ] Move `src/runtime/` core files → `src/core/runtime/`
  - [ ] index.ts
  - [ ] environment.ts
  - [ ] values.ts
  - [ ] builtins.ts (non-Discord)

#### 1.2 Discord Files
- [ ] Move `src/runtime/discord-*.ts` → `src/discord/extensions/`
- [ ] Create `src/discord/api/` structure
- [ ] Create `src/discord/events/` structure
- [ ] Create `src/discord/commands/` structure
- [ ] Create `src/discord/components/` structure
- [ ] Update `src/discord/index.ts` with new exports

#### 1.3 Update Imports
- [ ] Update all files importing from moved locations
- [ ] Update `tsconfig.json` path aliases if needed
- [ ] Update test files
- [ ] Verify build succeeds

**Deliverable**: Reorganized codebase with all files in new locations, all tests passing.

---

## Phase 2: Discord API Implementation (Weeks 2-24)

### 2.1 Critical Events & Interactions (Weeks 2-3)

#### Missing Events (49 total)
**Priority: CRITICAL**

##### AutoMod Events (4)
- [ ] autoModerationActionExecution
- [ ] autoModerationRuleCreate
- [ ] autoModerationRuleUpdate
- [ ] autoModerationRuleDelete

##### Application Commands (1)
- [ ] applicationCommandPermissionsUpdate

##### Audit Logs (1)
- [ ] guildAuditLogEntryCreate

##### Bans (2)
- [ ] guildBanAdd
- [ ] guildBanRemove

##### Channels (1)
- [ ] channelPinsUpdate

##### Emojis & Stickers (6)
- [ ] emojiCreate
- [ ] emojiUpdate
- [ ] emojiDelete
- [ ] stickerCreate
- [ ] stickerUpdate
- [ ] stickerDelete

##### Entitlements (3)
- [ ] entitlementCreate
- [ ] entitlementUpdate
- [ ] entitlementDelete

##### Guild Events (5)
- [ ] guildAvailable
- [ ] guildUnavailable
- [ ] guildIntegrationsUpdate
- [ ] guildMembersChunk
- [ ] guildMemberAvailable

##### Scheduled Events (5)
- [ ] guildScheduledEventCreate
- [ ] guildScheduledEventUpdate
- [ ] guildScheduledEventDelete
- [ ] guildScheduledEventUserAdd
- [ ] guildScheduledEventUserRemove

##### Invites (2)
- [ ] inviteCreate
- [ ] inviteDelete

##### Messages (6)
- [ ] messageDeleteBulk
- [ ] messageReactionAdd
- [ ] messageReactionRemove
- [ ] messageReactionRemoveAll
- [ ] messageReactionRemoveEmoji
- [ ] messagePollVoteAdd
- [ ] messagePollVoteRemove

##### Presence (1)
- [ ] presenceUpdate

##### Soundboard (5)
- [ ] soundboardSounds
- [ ] guildSoundboardSoundCreate
- [ ] guildSoundboardSoundUpdate
- [ ] guildSoundboardSoundDelete
- [ ] guildSoundboardSoundsUpdate

##### Stage Instances (3)
- [ ] stageInstanceCreate
- [ ] stageInstanceUpdate
- [ ] stageInstanceDelete

##### Subscriptions (3)
- [ ] subscriptionCreate
- [ ] subscriptionUpdate
- [ ] subscriptionDelete

##### Threads (6)
- [ ] threadCreate
- [ ] threadUpdate
- [ ] threadDelete
- [ ] threadListSync
- [ ] threadMembersUpdate
- [ ] threadMemberUpdate

##### Typing (1)
- [ ] typingStart

##### Users (1)
- [ ] userUpdate

##### Voice (3)
- [ ] voiceStateUpdate
- [ ] voiceServerUpdate
- [ ] voiceChannelEffectSend

##### Webhooks (1)
- [ ] webhooksUpdate

##### System (3)
- [ ] invalidated
- [ ] cacheSweep
- [ ] debug
- [ ] error
- [ ] warn

#### Interaction Features
- [ ] Implement autocomplete for slash commands
- [ ] Improve modal submit handling
- [ ] Add context menu commands (user)
- [ ] Add context menu commands (message)

**Files**:
- `src/discord/events/index.ts` (update)
- `src/discord/events/handlers.ts` (new)
- `src/discord/commands/autocomplete.ts` (new)
- `src/discord/commands/context.ts` (new)

---

### 2.2 Managers (Weeks 4-5)

#### Create 40 Manager Classes
**Priority: HIGH**

##### Application (3)
- [ ] ApplicationCommandManager
- [ ] ApplicationCommandPermissionsManager
- [ ] GuildApplicationCommandManager

##### AutoMod (1)
- [ ] AutoModerationRuleManager

##### Channels (6)
- [ ] GuildChannelManager (enhanced)
- [ ] CategoryChannelChildManager
- [ ] GuildTextThreadManager
- [ ] GuildForumThreadManager
- [ ] ThreadManager
- [ ] ThreadMemberManager

##### Emojis (3)
- [ ] ApplicationEmojiManager
- [ ] GuildEmojiManager
- [ ] GuildEmojiRoleManager

##### Guild Features (8)
- [ ] GuildBanManager
- [ ] GuildInviteManager
- [ ] GuildMemberManager (enhanced)
- [ ] GuildMemberRoleManager
- [ ] GuildScheduledEventManager
- [ ] GuildStickerManager
- [ ] GuildSoundboardSoundManager
- [ ] StageInstanceManager

##### Messages (7)
- [ ] MessageManager (enhanced)
- [ ] GuildMessageManager
- [ ] DMMessageManager
- [ ] PartialGroupDMMessageManager
- [ ] ReactionManager
- [ ] ReactionUserManager
- [ ] PollAnswerVoterManager

##### Monetization (2)
- [ ] EntitlementManager
- [ ] SubscriptionManager

##### Permissions (1)
- [ ] PermissionOverwriteManager

##### Presence (1)
- [ ] PresenceManager

##### Voice (2)
- [ ] ClientVoiceManager
- [ ] VoiceStateManager

**Files**: `src/discord/api/managers/*.ts` (40 files)

---

### 2.3 Structures (Weeks 6-8)

#### Create 120+ Structure Classes
**Priority: HIGH**

##### Application (6)
- [ ] ClientApplication
- [ ] Application
- [ ] ApplicationCommand
- [ ] ApplicationEmoji
- [ ] ApplicationRoleConnectionMetadata
- [ ] AuthorizingIntegrationOwners

##### AutoMod (2)
- [ ] AutoModerationRule
- [ ] AutoModerationActionExecution

##### Channels (10)
- [ ] AnnouncementChannel
- [ ] CategoryChannel
- [ ] DirectoryChannel
- [ ] DMChannel
- [ ] ForumChannel
- [ ] MediaChannel
- [ ] PartialGroupDMChannel
- [ ] StageChannel
- [ ] ThreadChannel
- [ ] ThreadOnlyChannel

##### Collections (4)
- [ ] Collector
- [ ] InteractionCollector
- [ ] MessageCollector
- [ ] ReactionCollector

##### Components (15)
- [ ] ActionRow
- [ ] ButtonComponent
- [ ] ChannelSelectMenuComponent
- [ ] MentionableSelectMenuComponent
- [ ] RoleSelectMenuComponent
- [ ] StringSelectMenuComponent
- [ ] UserSelectMenuComponent
- [ ] TextInputComponent
- [ ] FileComponent
- [ ] LabelComponent
- [ ] ContainerComponent
- [ ] SectionComponent
- [ ] SeparatorComponent
- [ ] TextDisplayComponent
- [ ] ThumbnailComponent

##### Entitlements (3)
- [ ] Entitlement
- [ ] SKU
- [ ] Subscription

##### Guild Features (12)
- [ ] GuildAuditLogs
- [ ] GuildAuditLogsEntry
- [ ] GuildBan
- [ ] GuildOnboarding
- [ ] GuildOnboardingPrompt
- [ ] GuildOnboardingPromptOption
- [ ] GuildPreview
- [ ] GuildScheduledEvent
- [ ] GuildTemplate
- [ ] WelcomeScreen
- [ ] WelcomeChannel
- [ ] Widget

##### Interactions (10)
- [ ] AutocompleteInteraction
- [ ] ButtonInteraction
- [ ] ChatInputCommandInteraction
- [ ] CommandInteraction
- [ ] CommandInteractionOptionResolver
- [ ] ContextMenuCommandInteraction
- [ ] MessageComponentInteraction
- [ ] MessageContextMenuCommandInteraction
- [ ] UserContextMenuCommandInteraction
- [ ] ModalSubmitInteraction

##### Invites (3)
- [ ] GuildInvite
- [ ] GroupDMInvite
- [ ] InviteGuild

##### Messages (6)
- [ ] MessagePayload
- [ ] MessageMentions
- [ ] MessageReaction
- [ ] Attachment
- [ ] Poll
- [ ] PollAnswer

##### Presence (4)
- [ ] Presence
- [ ] Activity
- [ ] ClientPresence
- [ ] RichPresenceAssets

##### Soundboard (1)
- [ ] SoundboardSound

##### Stage (1)
- [ ] StageInstance

##### Stickers (2)
- [ ] Sticker
- [ ] StickerPack

##### Team (2)
- [ ] Team
- [ ] TeamMember

##### Voice (3)
- [ ] VoiceState
- [ ] VoiceRegion
- [ ] VoiceChannelEffect

##### Webhooks (2)
- [ ] Webhook
- [ ] InteractionWebhook

**Files**: `src/discord/api/structures/*.ts` (120+ files)

---

### 2.4 Builders (Weeks 9-10)

#### Create 60+ Builder Classes
**Priority: HIGH**

##### Buttons (6)
- [ ] PrimaryButtonBuilder
- [ ] SecondaryButtonBuilder
- [ ] SuccessButtonBuilder
- [ ] DangerButtonBuilder
- [ ] LinkButtonBuilder
- [ ] PremiumButtonBuilder

##### Select Menus (6)
- [ ] StringSelectMenuBuilder
- [ ] StringSelectMenuOptionBuilder
- [ ] UserSelectMenuBuilder
- [ ] RoleSelectMenuBuilder
- [ ] ChannelSelectMenuBuilder
- [ ] MentionableSelectMenuBuilder

##### Text Input (2)
- [ ] TextInputBuilder
- [ ] FileUploadBuilder

##### Components V2 (9)
- [ ] ContainerBuilder
- [ ] FileBuilder
- [ ] MediaGalleryBuilder
- [ ] MediaGalleryItemBuilder
- [ ] SectionBuilder
- [ ] SeparatorBuilder
- [ ] TextDisplayBuilder
- [ ] ThumbnailBuilder
- [ ] LabelBuilder

##### Slash Commands (10)
- [ ] ChatInputCommandBuilder
- [ ] SlashCommandBuilder
- [ ] SlashCommandSubcommandBuilder
- [ ] SlashCommandSubcommandGroupBuilder
- [ ] SlashCommandStringOption
- [ ] SlashCommandIntegerOption
- [ ] SlashCommandNumberOption
- [ ] SlashCommandBooleanOption
- [ ] SlashCommandUserOption
- [ ] SlashCommandChannelOption
- [ ] SlashCommandRoleOption
- [ ] SlashCommandMentionableOption
- [ ] SlashCommandAttachmentOption

##### Context Menus (3)
- [ ] ContextMenuCommandBuilder
- [ ] MessageCommandBuilder
- [ ] UserCommandBuilder

##### Modals (1)
- [ ] ModalBuilder

##### Messages (4)
- [ ] MessageBuilder
- [ ] AttachmentBuilder
- [ ] AllowedMentions
- [ ] MessageReference

##### Embeds (3)
- [ ] EmbedAuthorBuilder
- [ ] EmbedFieldBuilder
- [ ] EmbedFooterBuilder

##### Polls (5)
- [ ] PollBuilder
- [ ] PollAnswerBuilder
- [ ] PollAnswerMediaBuilder
- [ ] PollMediaBuilder
- [ ] PollQuestionBuilder

**Files**: `src/discord/api/builders/*.ts` (60+ files)

---

### 2.5 Channel & Thread Management (Weeks 11-12)

- [ ] Thread creation (public/private)
- [ ] Thread join/leave
- [ ] Thread archive/unarchive
- [ ] Thread member management
- [ ] Thread metadata
- [ ] Forum channel creation
- [ ] Forum post creation
- [ ] Forum tags
- [ ] Stage channel management
- [ ] Channel following (announcement channels)

**Files**:
- `src/discord/extensions/threads.ts` (enhanced)
- `src/discord/extensions/forums.ts` (new)
- `src/discord/extensions/stages.ts` (new)

---

### 2.6 Guild Administration (Weeks 13-14)

- [ ] Guild scheduled events (create, update, delete, list)
- [ ] Scheduled event users (add, remove, list)
- [ ] Welcome screens (get, update)
- [ ] Guild templates (create, sync, apply)
- [ ] Invite management (create with options, delete, list)
- [ ] Vanity URL management
- [ ] Guild widget settings

**Files**:
- `src/discord/extensions/events.ts` (new)
- `src/discord/extensions/templates.ts` (new)
- `src/discord/extensions/invites.ts` (new)

---

### 2.7 Advanced Message Features (Weeks 15-16)

- [ ] Message reactions (bulk operations)
- [ ] Message polls (create, end, get results)
- [ ] Poll vote tracking
- [ ] Sticker operations (create, delete, list, edit)
- [ ] Message threads (start from message)

**Files**:
- `src/discord/extensions/polls.ts` (enhanced)
- `src/discord/extensions/stickers.ts` (new)

---

### 2.8 Role & Permission System (Week 17)

- [ ] Advanced role management (reorder, icons)
- [ ] Permission overwrites (channels)
- [ ] Permission calculations
- [ ] App permissions checking
- [ ] All permission flags (BitFields)

**Files**:
- `src/discord/api/permissions.ts` (new)

---

### 2.9 Moderation & Safety (Week 18)

- [ ] Ban management (with options, delete message days)
- [ ] Kick operations
- [ ] Timeout management (timeouts, remove timeouts)
- [ ] AutoMod rule management (expanded)
- [ ] Audit log queries (with filters)

**Files**:
- `src/discord/extensions/automod.ts` (enhanced)
- `src/discord/extensions/audit.ts` (enhanced)

---

### 2.10 Voice & Audio (Weeks 19-20)

- [ ] Voice state updates
- [ ] Voice region selection
- [ ] Audio stream handling
- [ ] Voice channel status
- [ ] Audio player
- [ ] Audio resources
- [ ] Volume control
- [ ] FFmpeg integration

**Files**:
- `src/discord/voice/` (complete rewrite)

---

### 2.11 Webhook System (Week 21)

- [ ] Webhook creation with avatar/name
- [ ] Webhook execution with components
- [ ] Webhook message editing
- [ ] Webhook deletion and management
- [ ] Follower webhooks
- [ ] Thread webhooks

**Files**:
- `src/discord/extensions/webhooks.ts` (enhanced)

---

### 2.12 User & Member Management (Week 22)

- [ ] Member search and list
- [ ] Member roles bulk update
- [ ] User profile fetching
- [ ] Member nickname management
- [ ] Member kick/ban/timeout

**Files**:
- `src/discord/api/managers/guild-member-manager.ts` (enhanced)

---

### 2.13 Advanced UI Components (Week 23)

- [ ] String select menus
- [ ] User select menus
- [ ] Role select menus
- [ ] Channel select menus
- [ ] Mentionable select menus
- [ ] Text inputs in modals
- [ ] Views system
- [ ] Persistent views

**Files**:
- `src/discord/components/` (complete)

---

### 2.14 Application & Integration (Week 24)

- [ ] Application commands (global, guild)
- [ ] Application command permissions
- [ ] OAuth2 integration helpers
- [ ] Application info fetching

**Files**:
- `src/discord/api/application.ts` (new)

---

### 2.15 Final Features & Polish (Week 24)

- [ ] Emojis management (create, delete, edit)
- [ ] Guild discovery settings
- [ ] Integration management
- [ ] Widget generation
- [ ] Onboarding flow management

**Files**:
- Various enhancements

---

## Phase 3: Comprehensive Test Bot (Week 24)

### Create Ultimate test-bot.ez

A single, comprehensive test file that exercises EVERY Discord feature:

```easylang
// test-bot.ez - COMPREHENSIVE Discord Feature Test
// WARNING: This file is git-ignored and should NEVER be committed
// Contains all 79 events, all slash commands, all components, all features

use discord

// Bot token from environment
var token = env("DISCORD_BOT_TOKEN")

// Initialize bot
discord_init(token)

// ========================================
// ALL 79 EVENTS
// ========================================

// Core Events
listen ready as client {
    print("Bot is ready!")
    print("Logged in as: " + client.user.tag)
}

listen messageCreate as message {
    if message.content == "!ping" {
        reply message, "Pong!"
    }
}

// ... (continue with all 79 events)

// ========================================
// SLASH COMMANDS
// ========================================

// Register comprehensive slash commands
discord_register_slash_command({
    name: "test",
    description: "Test all command features",
    options: [
        {
            type: "STRING",
            name: "input",
            description: "Test input",
            required: true,
            autocomplete: true
        }
    ]
})

// ... (continue with all command types)

// ========================================
// UI COMPONENTS
// ========================================

// Test all button types
// Test all select menus
// Test modals
// Test views

// ========================================
// VOICE OPERATIONS
// ========================================

// Test voice connection
// Test audio playback
// Test voice effects

// ========================================
// THREAD OPERATIONS
// ========================================

// Test thread creation
// Test forum operations
// Test thread management

// ... (continue with ALL features)

// Start the bot
discord_start()
```

**Requirements**:
- Must test every single feature
- Must be git-ignored
- Must include inline documentation
- Must have error handling
- Must demonstrate all 79 events
- Must demonstrate all component types
- Must demonstrate all manager operations

---

## Quality Assurance

### Testing Strategy

1. **Unit Tests**
   - Test each manager class
   - Test each structure class
   - Test each builder class
   - Test event conversions

2. **Integration Tests**
   - Test complete workflows
   - Test event → handler → response
   - Test command registration → execution

3. **Backward Compatibility Tests**
   - Run existing .ez examples
   - Verify no breaking changes
   - Test migration path

### Documentation

- [ ] Update README.md with new features
- [ ] Create API documentation for all new features
- [ ] Add JSDoc comments to all public APIs
- [ ] Create migration guide for existing users
- [ ] Add examples for each feature category

### Performance

- [ ] Benchmark event processing
- [ ] Optimize manager caching
- [ ] Profile memory usage
- [ ] Test with large guilds (10,000+ members)

---

## Success Criteria

- [ ] All 79 Discord events implemented and tested
- [ ] All 40 managers implemented
- [ ] All 120+ structures implemented
- [ ] All 60+ builders implemented
- [ ] Comprehensive test bot covers all features
- [ ] All tests pass
- [ ] No breaking changes to existing code
- [ ] Documentation complete
- [ ] Performance benchmarks met

---

## Progress Tracking

### Overall Progress: 5% (Phase 1 started)

| Phase | Status | Progress | ETA |
|-------|--------|----------|-----|
| 1. Reorganization | In Progress | 10% | Week 1 |
| 2. Events & Interactions | Not Started | 0% | Weeks 2-3 |
| 3. Managers | Not Started | 0% | Weeks 4-5 |
| 4. Structures | Not Started | 0% | Weeks 6-8 |
| 5. Builders | Not Started | 0% | Weeks 9-10 |
| 6. Channels & Threads | Not Started | 0% | Weeks 11-12 |
| 7. Guild Admin | Not Started | 0% | Weeks 13-14 |
| 8. Messages | Not Started | 0% | Weeks 15-16 |
| 9. Permissions | Not Started | 0% | Week 17 |
| 10. Moderation | Not Started | 0% | Week 18 |
| 11. Voice | Not Started | 0% | Weeks 19-20 |
| 12. Webhooks | Not Started | 0% | Week 21 |
| 13. Users | Not Started | 0% | Week 22 |
| 14. UI Components | Not Started | 0% | Week 23 |
| 15. Application | Not Started | 0% | Week 24 |
| 16. Test Bot | Not Started | 0% | Week 24 |

---

## Risk Management

### Identified Risks

1. **Scope Creep**: Feature set is massive
   - Mitigation: Strict phase boundaries, no feature additions during implementation

2. **Breaking Changes**: Reorganization may break existing code
   - Mitigation: Comprehensive testing, maintain aliases for old imports

3. **Discord API Changes**: Discord.js may update during implementation
   - Mitigation: Lock Discord.js version, plan for updates in separate phase

4. **Performance Issues**: Large codebases can be slow
   - Mitigation: Lazy loading, efficient caching, performance testing

---

## Next Steps

1. Complete Phase 1 reorganization
2. Set up new directory structure
3. Move existing files systematically
4. Update all imports
5. Verify build and tests
6. Begin Phase 2 implementation

---

**Last Updated**: 2026-01-16
**Next Review**: 2026-01-23
