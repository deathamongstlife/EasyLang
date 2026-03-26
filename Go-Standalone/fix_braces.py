import os

files = [
    '/root/EZLang/Go-Standalone/internal/runtime/runtime_extended.go',
    '/root/EZLang/Go-Standalone/internal/runtime/runtime_v2.go',
]

for fpath in files:
    with open(fpath, 'r') as f:
        content = f.read()
    
    content = content.replace("}\n\n\tcase *", "})\n\n\tcase *")
    content = content.replace("}\n\t}\n\treturn nil\n}", "})\n\t}\n\treturn nil\n}")
    
    with open(fpath, 'w') as f:
        f.write(content)
