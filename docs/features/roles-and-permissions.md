---
layout: default
title: Roles & Permissions
description: Manage roles and permissions
---

# Roles & Permissions

Create roles, assign them, and manage permissions.

## Functions

- `create_role` - Create a new role
- `edit_role` - Modify role properties
- `delete_role` - Delete a role
- `add_role` - Add role to member
- `remove_role` - Remove role from member
- `has_permission` - Check if has permission
- `get_member_roles` - Get member's roles

## Example

```ezlang
// Create a new role
let role = create_role(guild_id, {
    "name": "VIP",
    "color": "#5865F2",
    "permissions": "8",  // Administrator
    "hoist": true
})

// Add role to member
add_role(guild_id, member_id, role.id)

// Check permission
if has_permission(member, "MANAGE_MESSAGES") {
    print("Member can manage messages")
}
```

[← Back to Features](/EasyLang/features/)
