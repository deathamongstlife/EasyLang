package main

import (
    "fmt"
    "github.com/ezlang/ezbot/internal/discord"
    "reflect"
)

func main() {
    clientType := reflect.TypeOf(&discord.Client{})
    fmt.Printf("Total Native Go Client Methods: %d\n", clientType.NumMethod())
}
