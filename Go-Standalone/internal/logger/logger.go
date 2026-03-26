package logger

import (
	"fmt"
	"time"
)

const (
	ColorReset  = "\033[0m"
	ColorRed    = "\033[31m"
	ColorGreen  = "\033[32m"
	ColorYellow = "\033[33m"
	ColorBlue   = "\033[34m"
	ColorPurple = "\033[35m"
	ColorCyan   = "\033[36m"
	ColorGray   = "\033[37m"
)

type LogLevel int

const (
	LevelDebug LogLevel = iota
	LevelInfo
	LevelWarn
	LevelError
	LevelFatal
)

var currentLevel = LevelInfo

func SetLevel(level LogLevel) {
	currentLevel = level
}

func formatTime() string {
	return time.Now().Format("2006-01-02 15:04:05.000")
}

func logMessage(level LogLevel, prefix, color, message string) {
	if level >= currentLevel {
		fmt.Printf("%s[%s]%s %s%s%s %s\n", ColorGray, formatTime(), ColorReset, color, prefix, ColorReset, message)
	}
}

func Debug(msg string, args ...interface{}) {
	logMessage(LevelDebug, "DEBUG", ColorBlue, fmt.Sprintf(msg, args...))
}

func Info(msg string, args ...interface{}) {
	logMessage(LevelInfo, "INFO", ColorGreen, fmt.Sprintf(msg, args...))
}

func Warn(msg string, args ...interface{}) {
	logMessage(LevelWarn, "WARN", ColorYellow, fmt.Sprintf(msg, args...))
}

func Error(msg string, args ...interface{}) {
	logMessage(LevelError, "ERROR", ColorRed, fmt.Sprintf(msg, args...))
}

func Fatal(msg string, args ...interface{}) {
	logMessage(LevelFatal, "FATAL", ColorPurple, fmt.Sprintf(msg, args...))
}

func Discord(msg string, args ...interface{}) {
	logMessage(LevelInfo, "DISCORD", ColorCyan, fmt.Sprintf(msg, args...))
}

func Parse(msg string, args ...interface{}) {
	logMessage(LevelDebug, "PARSER", ColorGray, fmt.Sprintf(msg, args...))
}

func Module(msg string, args ...interface{}) {
	logMessage(LevelInfo, "MODULE", ColorYellow, fmt.Sprintf(msg, args...))
}
