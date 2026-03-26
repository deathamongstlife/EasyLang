import subprocess
import os
import sys

class EzLangBot:
    def __init__(self, script_path, env_vars=None):
        self.script_path = os.path.abspath(script_path)
        self.env_vars = env_vars or {}
        self.process = None

    def start(self):
        # Locate the compiled Go binary
        binary_path = os.path.join(os.path.dirname(__file__), '..', '..', 'ezbot')
        
        # Merge environment variables
        env = os.environ.copy()
        env.update(self.env_vars)
        
        print(f"Starting EzLang bot with script: {self.script_path}")
        
        self.process = subprocess.Popen(
            [binary_path, "run", self.script_path],
            env=env,
            stdout=sys.stdout,
            stderr=sys.stderr
        )
        
        return self.process

    def stop(self):
        if self.process:
            self.process.terminate()
            self.process.wait()
            print("EzLang bot stopped.")
