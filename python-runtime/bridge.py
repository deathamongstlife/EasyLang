"""
Python Bridge Server for EzLang
Provides IPC communication layer between Node.js and Python
"""

import ipc
import importlib
import json
import sys
import traceback


class PythonBridge:
    """Python bridge server for EzLang"""

    def __init__(self):
        self.modules = {}  # Cache imported modules
        self.server = ipc.Server()

    def import_module(self, module_name):
        """Import a Python module"""
        try:
            if module_name not in self.modules:
                self.modules[module_name] = importlib.import_module(module_name)
            return {"success": True, "module": module_name}
        except ImportError as e:
            return {"success": False, "error": str(e)}
        except Exception as e:
            return {"success": False, "error": f"Unexpected error: {str(e)}"}

    def call_function(self, module_name, function_name, args):
        """Call a function from an imported module"""
        try:
            if module_name not in self.modules:
                return {"success": False, "error": f"Module {module_name} not imported"}

            module = self.modules[module_name]
            func = getattr(module, function_name)
            result = func(*args)

            # Convert result to JSON-serializable format
            serialized = self._serialize(result)
            return {"success": True, "result": serialized}
        except AttributeError as e:
            return {"success": False, "error": f"Function '{function_name}' not found in module '{module_name}'"}
        except Exception as e:
            return {"success": False, "error": f"Error calling function: {str(e)}"}

    def get_attribute(self, module_name, attr_path):
        """Get an attribute from a module (supports nested access)"""
        try:
            if module_name not in self.modules:
                return {"success": False, "error": f"Module {module_name} not imported"}

            obj = self.modules[module_name]
            for attr in attr_path:
                obj = getattr(obj, attr)

            serialized = self._serialize(obj)
            return {"success": True, "result": serialized}
        except AttributeError as e:
            attr_name = '.'.join(attr_path)
            return {"success": False, "error": f"Attribute '{attr_name}' not found in module '{module_name}'"}
        except Exception as e:
            return {"success": False, "error": f"Error getting attribute: {str(e)}"}

    def _serialize(self, obj):
        """Convert Python objects to JSON-serializable format"""
        # Handle None
        if obj is None:
            return None

        # Handle basic types
        if isinstance(obj, (bool, int, float, str)):
            return obj

        # Handle lists and tuples
        if isinstance(obj, (list, tuple)):
            return [self._serialize(item) for item in obj]

        # Handle dictionaries
        if isinstance(obj, dict):
            return {k: self._serialize(v) for k, v in obj.items()}

        # Handle callable objects (functions, methods)
        if callable(obj):
            return {
                "__type__": "function",
                "__name__": getattr(obj, "__name__", "<anonymous>"),
                "__module__": getattr(obj, "__module__", None)
            }

        # For other objects, try to return a string representation
        try:
            # Try to convert to dict if object has __dict__
            if hasattr(obj, "__dict__"):
                return {
                    "__type__": "object",
                    "__class__": obj.__class__.__name__,
                    "__repr__": str(obj)
                }
            else:
                return {
                    "__type__": "object",
                    "__repr__": str(obj)
                }
        except Exception:
            return {
                "__type__": "unknown",
                "__repr__": str(obj)
            }

    def start(self, socket_name="ezlang-python-bridge"):
        """Start the IPC server"""
        self.server.listen(socket_name)

        @self.server.on("import")
        def handle_import(data):
            return self.import_module(data["module"])

        @self.server.on("call")
        def handle_call(data):
            return self.call_function(
                data["module"],
                data["function"],
                data.get("args", [])
            )

        @self.server.on("get")
        def handle_get(data):
            return self.get_attribute(
                data["module"],
                data["path"]
            )

        print(f"Python bridge listening on {socket_name}", flush=True)
        self.server.start()


if __name__ == "__main__":
    try:
        bridge = PythonBridge()
        bridge.start()
    except Exception as e:
        print(f"Error starting Python bridge: {e}", file=sys.stderr)
        traceback.print_exc()
        sys.exit(1)
