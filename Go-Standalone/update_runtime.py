import re

with open("internal/runtime/runtime.go", "r") as f:
    content = f.read()

new_cases = """        case *ast.DeferReplyCommand:
                if contextInteraction, ok := env.Get("__context_interaction"); ok {
                        if intObj, isInt := contextInteraction.(*discord.Interaction); isInt {
                                e.discordClient.DeferInteraction(intObj.ID, intObj.Token)
                        }
                }

        case *ast.EditReplyCommand:
                msgStr := e.evalExpression(n.Message, env)
                if contextInteraction, ok := env.Get("__context_interaction"); ok {
                        if intObj, isInt := contextInteraction.(*discord.Interaction); isInt {
                                e.discordClient.EditInteractionResponse(e.discordClient.AppID, intObj.Token, msgStr, nil, nil)
                        }
                }

        case *ast.ReplyWithModalCommand:
                modalId := e.evalExpression(n.ModalID, env)
                title := e.evalExpression(n.Title, env)

                // Simple modal with one text input
                modal := discord.Component{
                        Type:     9,
                        Title:    title,
                        CustomID: modalId,
                        Components: []discord.Component{
                                {
                                        Type: 1, // Action Row
                                        Components: []discord.Component{
                                                {
                                                        Type:     4, // Text Input
                                                        CustomID: "input_" + modalId,
                                                        Label:    "Input",
                                                        Style:    1,
                                                },
                                        },
                                },
                        },
                }

                if contextInteraction, ok := env.Get("__context_interaction"); ok {
                        if intObj, isInt := contextInteraction.(*discord.Interaction); isInt {
                                e.discordClient.ShowModal(intObj.ID, intObj.Token, modal)
                        }
                }

        case *ast.WhenModalSubmittedCommand:
                expectedModal := e.evalExpression(n.ModalID, env)

                e.discordClient.OnInteractionCreate(func(interaction *discord.Interaction) {
                        if interaction.Type == 5 && interaction.Data.CustomID == expectedModal {
                                handlerEnv := NewEnclosedEnvironment(env)
                                handlerEnv.Set("__context_interaction", interaction)

                                // Extract modal inputs
                                for _, row := range interaction.Data.Components {
                                        for _, comp := range row.Components {
                                                handlerEnv.Set(comp.CustomID, comp.Value)
                                                // Also provide without input_ prefix if present for convenience
                                                if strings.HasPrefix(comp.CustomID, "input_") {
                                                        handlerEnv.Set(strings.TrimPrefix(comp.CustomID, "input_"), comp.Value)
                                                }
                                        }
                                }

                                e.evalBlock(n.Body, handlerEnv)
                        }
                })"""

# Insert before "default:" in evalStatement
content = content.replace("        default:\n                // ignore unknown node types for now", new_cases + "\n\n        default:\n                // ignore unknown node types for now")

with open("internal/runtime/runtime.go", "w") as f:
    f.write(content)
