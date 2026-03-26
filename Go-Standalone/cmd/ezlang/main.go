package main

import (
	"fmt"
	"os"
	"github.com/ezlang/ezbot/internal/logger"

	"github.com/ezlang/ezbot/internal/lexer"
	"github.com/ezlang/ezbot/internal/parser"
	"github.com/ezlang/ezbot/internal/runtime"
	"github.com/ezlang/ezbot/internal/ast"
)

func parseSource(source string) (*ast.Program, error) {
	l := lexer.New(string(source))
	tokens := l.Tokenize()
	p := parser.New(tokens)
	return p.Parse()
}

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: ezbot run <file.ez>")
		os.Exit(1)
	}

	command := os.Args[1]
	if command != "run" {
		fmt.Printf("Unknown command: %s\n", command)
		os.Exit(1)
	}

	if len(os.Args) < 3 {
		fmt.Println("Please provide a file to run.")
		os.Exit(1)
	}

	filePath := os.Args[2]
	source, err := os.ReadFile(filePath)
	if err != nil {
		logger.Fatal("Failed to read file: %v", err)
		os.Exit(1)
	}

	// 1 & 2. Lexical Analysis & Parsing
	logger.Parse("Tokenizing and Parsing %s...", filePath)
	program, err := parseSource(string(source))
	if err != nil {
		logger.Error("Parse Error: %v", err)
		os.Exit(1)
	}

	// 3. Runtime Evaluation
	logger.Info("Initializing Runtime...")
	engine := runtime.New()
	engine.CurrentFilePath = filePath
	
	// Inject parser for multi-file includes
	engine.ParserFunc = func(src string) (*ast.Program, error) {
	    return parseSource(src)
	}

	logger.Info("Executing...")
	err = engine.Execute(program)
	if err != nil {
		logger.Error("Runtime Error: %v", err)
		os.Exit(1)
	}

	// Keep process alive if a bot was started
	if engine.HasActiveBot() {
		engine.WaitForInterrupt()
	}
}
