package runtime

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
	"github.com/ezlang/ezbot/internal/logger"
)

func RegisterBuiltins(env *Environment, engine *Engine) {
	env.Set("print", func(args ...interface{}) interface{} {
		var strArgs []string
		for _, arg := range args {
			strArgs = append(strArgs, fmt.Sprintf("%v", arg))
		}
		msg := strings.Join(strArgs, " ")
		
		// If msg contains ANSI escape codes, print it directly to avoid double-logging
		if strings.Contains(msg, "\033[") {
			fmt.Println(msg)
		} else {
			logger.Info(msg)
		}
		return nil
	})

	env.Set("get_time", func(args ...interface{}) interface{} {
		return time.Now().UnixMilli()
	})
	
	env.Set("get_bot_ping", func(args ...interface{}) interface{} {
	    // mock ping calculation
		return 42 
	})

	env.Set("length", func(args ...interface{}) interface{} {
		if len(args) == 0 { return 0 }
		switch v := args[0].(type) {
		case string: return len(v)
		case []string: return len(v)
		case []interface{}: return len(v)
		case map[string]interface{}: return len(v)
		}
		return 0
	})

	env.Set("slice", func(args ...interface{}) interface{} {
		if len(args) < 2 { return args[0] }
		var start, end int
		fmt.Sscanf(fmt.Sprintf("%v", args[1]), "%d", &start)
		
		switch v := args[0].(type) {
		case []string:
			end = len(v)
			if len(args) > 2 {
				fmt.Sscanf(fmt.Sprintf("%v", args[2]), "%d", &end)
			}
			if start < 0 { start = 0 }
			if end > len(v) { end = len(v) }
			if start > end { return []string{} }
			return v[start:end]
		case []interface{}:
			end = len(v)
			if len(args) > 2 {
				fmt.Sscanf(fmt.Sprintf("%v", args[2]), "%d", &end)
			}
			if start < 0 { start = 0 }
			if end > len(v) { end = len(v) }
			if start > end { return []interface{}{} }
			return v[start:end]
		case string:
			end = len(v)
			if len(args) > 2 {
				fmt.Sscanf(fmt.Sprintf("%v", args[2]), "%d", &end)
			}
			if start < 0 { start = 0 }
			if end > len(v) { end = len(v) }
			if start > end { return "" }
			return v[start:end]
		}
		return args[0]
	})

	env.Set("join", func(args ...interface{}) interface{} {
		if len(args) < 1 { return "" }
		sep := ","
		if len(args) > 1 {
			sep = fmt.Sprintf("%v", args[1])
		}
		switch v := args[0].(type) {
		case []string:
			return strings.Join(v, sep)
		case []interface{}:
			var strParts []string
			for _, p := range v {
				strParts = append(strParts, fmt.Sprintf("%v", p))
			}
			return strings.Join(strParts, sep)
		}
		return fmt.Sprintf("%v", args[0])
	})

	env.Set("split", func(args ...interface{}) interface{} {
		if len(args) < 2 { return args[0] }
		s := fmt.Sprintf("%v", args[0])
		sep := fmt.Sprintf("%v", args[1])
		return strings.Split(s, sep)
	})

	env.Set("get_mention_id", func(args ...interface{}) interface{} {
		if len(args) == 0 { return "" }
		m := fmt.Sprintf("%v", args[0])
		if strings.HasPrefix(m, "<@") && strings.HasSuffix(m, ">") {
			id := m[2:len(m)-1]
			if strings.HasPrefix(id, "!") || strings.HasPrefix(id, "&") {
				id = id[1:]
			}
			return id
		}
		return m
	})

	env.Set("to_number", func(args ...interface{}) interface{} {
		if len(args) == 0 { return 0 }
		var n int
		fmt.Sscanf(fmt.Sprintf("%v", args[0]), "%d", &n)
		return n
	})

	env.Set("to_string", func(args ...interface{}) interface{} {
		if len(args) == 0 { return "" }
		return fmt.Sprintf("%v", args[0])
	})

	env.Set("encode_uri", func(args ...interface{}) interface{} {
		if len(args) == 0 { return "" }
		return strings.ReplaceAll(fmt.Sprintf("%v", args[0]), " ", "%20")
	})

	env.Set("http_get", func(args ...interface{}) interface{} {
		if len(args) == 0 { return nil }
		url := fmt.Sprintf("%v", args[0])
		resp, err := http.Get(url)
		if err != nil { return nil }
		defer resp.Body.Close()
		body, _ := io.ReadAll(resp.Body)
		return string(body)
	})

	env.Set("to_json", func(args ...interface{}) interface{} {
		if len(args) == 0 { return nil }
		var data interface{}
		err := json.Unmarshal([]byte(fmt.Sprintf("%v", args[0])), &data)
		if err != nil { return nil }
		return data
	})

	env.Set("random", func(args ...interface{}) interface{} {
		if len(args) == 0 { return 0.0 }
		// if args[0] is array, pick one
		if v, ok := args[0].([]string); ok {
			if len(v) == 0 { return "" }
			return v[time.Now().UnixNano()%int64(len(v))]
		}
		if v, ok := args[0].([]interface{}); ok {
			if len(v) == 0 { return nil }
			return v[time.Now().UnixNano()%int64(len(v))]
		}
		return 0.0
	})

	env.Set("random_int", func(args ...interface{}) interface{} {
		if len(args) < 2 { return 0 }
		var min, max int
		fmt.Sscanf(fmt.Sprintf("%v", args[0]), "%d", &min)
		fmt.Sscanf(fmt.Sprintf("%v", args[1]), "%d", &max)
		if max <= min { return min }
		return min + int(time.Now().UnixNano() % int64(max-min))
	})

	env.Set("get_option", func(args ...interface{}) interface{} {
		if len(args) == 0 { return nil }
		name := fmt.Sprintf("%v", args[0])
		if val, ok := env.Get(name); ok {
			return val
		}
		return nil
	})

	env.Set("get_member", func(args ...interface{}) interface{} {
		if len(args) < 2 { return nil }
		guildID := fmt.Sprintf("%v", args[0])
		userID := fmt.Sprintf("%v", args[1])
		member, err := engine.discordClient.GetMember(guildID, userID)
		if err != nil { return nil }
		return member
	})

	env.Set("discord_request", func(args ...interface{}) interface{} {
		if len(args) < 2 { return nil }
		method := fmt.Sprintf("%v", args[0])
		endpoint := fmt.Sprintf("%v", args[1])
		
		var payload interface{}
		if len(args) > 2 {
			payload = args[2]
		}
		
		url := "https://discord.com/api/v10" + endpoint
		var bodyReader io.Reader
		
		if payload != nil {
			bodyBytes, _ := json.Marshal(payload)
			bodyReader = bytes.NewBuffer(bodyBytes)
		}
		
		req, err := http.NewRequest(method, url, bodyReader)
		if err != nil { return nil }
		
		req.Header.Set("Authorization", "Bot " + engine.discordClient.Token)
		if payload != nil {
			req.Header.Set("Content-Type", "application/json")
		}
		
		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil { return nil }
		defer resp.Body.Close()
		
		var result interface{}
		json.NewDecoder(resp.Body).Decode(&result)
		return result
	})
}
