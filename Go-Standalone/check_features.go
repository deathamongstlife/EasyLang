package main

import (
    "fmt"
    "github.com/ezlang/ezbot/internal/discord"
    "reflect"
)

func main() {
    clientType := reflect.TypeOf(&discord.Client{})
    fmt.Printf("Number of methods on Client: %d\n", clientType.NumMethod())
}
