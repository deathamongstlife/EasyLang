package discord


func CreateActionRow(components ...Component) Component {
	return Component{
		Type:       1,
		Components: components,
	}
}

func CreateButton(customID, label string, style int) Component {
	return Component{
		Type:     2,
		CustomID: customID,
		Label:    label,
		Style:    style,
	}
}

func CreateSelectMenu(customID string, options []SelectOption) Component {
	return Component{
		Type:     3,
		CustomID: customID,
		Options:  options,
	}
}

func CreateUserSelectMenu(customID string) Component {
	return Component{Type: 5, CustomID: customID}
}

func CreateRoleSelectMenu(customID string) Component {
	return Component{Type: 6, CustomID: customID}
}

func CreateMentionableSelectMenu(customID string) Component {
	return Component{Type: 7, CustomID: customID}
}

func CreateChannelSelectMenu(customID string) Component {
	return Component{Type: 8, CustomID: customID}
}