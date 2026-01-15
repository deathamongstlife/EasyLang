"""
Enhanced Python Bridge Server for EzLang
Provides comprehensive IPC communication layer between Node.js and Python
Supports:
- Module imports with auto-install
- Function calls with complex arguments
- Class instantiation and method calls
- Async/await support
- Type conversion
- Error handling with stack traces
"""

import ipc
import importlib
import subprocess
import sys
import traceback
import inspect
import asyncio
from typing import Any, Dict, Optional
import uuid


class PythonBridge:
    """Enhanced Python bridge server for EzLang"""

    def __init__(self):
        self.modules = {}  # Cache imported modules
        self.instances = {}  # Cache created instances
        self.server = ipc.Server()

    def import_module(self, module_name: str, auto_install: bool = True) -> Dict[str, Any]:
        """Import a Python module with optional auto-install"""
        try:
            if module_name not in self.modules:
                try:
                    self.modules[module_name] = importlib.import_module(module_name)
                except ImportError as import_error:
                    # Try to auto-install if enabled
                    if auto_install:
                        print(f"Module {module_name} not found, attempting auto-install...", flush=True)
                        install_success = self._install_package(module_name)
                        if install_success:
                            # Try import again
                            self.modules[module_name] = importlib.import_module(module_name)
                        else:
                            return {
                                "success": False,
                                "error": f"Failed to auto-install module '{module_name}': {str(import_error)}"
                            }
                    else:
                        raise import_error

            return {"success": True, "module": module_name}
        except ImportError as e:
            return {"success": False, "error": f"Import error: {str(e)}"}
        except Exception as e:
            return {"success": False, "error": f"Unexpected error: {str(e)}\n{traceback.format_exc()}"}

    def _install_package(self, package_name: str) -> bool:
        """Install Python package using pip"""
        try:
            # Try pip install
            result = subprocess.run(
                [sys.executable, "-m", "pip", "install", package_name],
                capture_output=True,
                text=True,
                timeout=120  # 2 minute timeout
            )

            if result.returncode == 0:
                print(f"Successfully installed {package_name}", flush=True)
                return True

            # If normal install fails, try with --user flag
            if "externally-managed-environment" in result.stderr or result.returncode != 0:
                print(f"Retrying with --user flag...", flush=True)
                result = subprocess.run(
                    [sys.executable, "-m", "pip", "install", "--user", package_name],
                    capture_output=True,
                    text=True,
                    timeout=120
                )
                if result.returncode == 0:
                    print(f"Successfully installed {package_name} with --user", flush=True)
                    return True

            print(f"Failed to install {package_name}: {result.stderr}", flush=True)
            return False

        except Exception as e:
            print(f"Exception during package installation: {e}", flush=True)
            return False

    def install_package(self, package_name: str) -> Dict[str, Any]:
        """Explicitly install a Python package"""
        try:
            success = self._install_package(package_name)
            if success:
                return {"success": True, "package": package_name}
            else:
                return {"success": False, "error": f"Failed to install package '{package_name}'"}
        except Exception as e:
            return {"success": False, "error": f"Installation error: {str(e)}"}

    def call_function(self, module_name: str, function_name: str, args: list) -> Dict[str, Any]:
        """Call a function from an imported module"""
        try:
            if module_name not in self.modules:
                return {"success": False, "error": f"Module {module_name} not imported"}

            module = self.modules[module_name]

            # Navigate nested attributes (e.g., "os.path.join" -> os.path, join)
            obj = module
            parts = function_name.split('.')
            for part in parts:
                obj = getattr(obj, part)

            # Check if it's async
            if inspect.iscoroutinefunction(obj):
                # Run async function
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                try:
                    result = loop.run_until_complete(obj(*args))
                finally:
                    loop.close()
            else:
                # Regular function call
                result = obj(*args)

            # Convert result to JSON-serializable format
            serialized = self._serialize(result)
            return {"success": True, "result": serialized}

        except AttributeError as e:
            return {"success": False, "error": f"Function '{function_name}' not found in module '{module_name}'"}
        except TypeError as e:
            return {"success": False, "error": f"Type error calling function: {str(e)}"}
        except Exception as e:
            return {"success": False, "error": f"Error calling function: {str(e)}\n{traceback.format_exc()}"}

    def get_attribute(self, module_name: str, attr_path: list) -> Dict[str, Any]:
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
            return {"success": False, "error": f"Error getting attribute: {str(e)}\n{traceback.format_exc()}"}

    def create_instance(self, module_name: str, class_name: str, args: list) -> Dict[str, Any]:
        """Create an instance of a Python class"""
        try:
            if module_name not in self.modules:
                return {"success": False, "error": f"Module {module_name} not imported"}

            module = self.modules[module_name]
            cls = getattr(module, class_name)

            # Create instance
            instance = cls(*args)

            # Generate unique ID for instance
            instance_id = str(uuid.uuid4())
            self.instances[instance_id] = instance

            return {"success": True, "instance_id": instance_id}

        except AttributeError as e:
            return {"success": False, "error": f"Class '{class_name}' not found in module '{module_name}'"}
        except Exception as e:
            return {"success": False, "error": f"Error creating instance: {str(e)}\n{traceback.format_exc()}"}

    def call_method(self, instance_id: str, method_name: str, args: list) -> Dict[str, Any]:
        """Call a method on a Python instance"""
        try:
            if instance_id not in self.instances:
                return {"success": False, "error": f"Instance {instance_id} not found"}

            instance = self.instances[instance_id]
            method = getattr(instance, method_name)

            # Check if it's async
            if inspect.iscoroutinefunction(method):
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                try:
                    result = loop.run_until_complete(method(*args))
                finally:
                    loop.close()
            else:
                result = method(*args)

            serialized = self._serialize(result)
            return {"success": True, "result": serialized}

        except AttributeError as e:
            return {"success": False, "error": f"Method '{method_name}' not found on instance"}
        except Exception as e:
            return {"success": False, "error": f"Error calling method: {str(e)}\n{traceback.format_exc()}"}

    def _serialize(self, obj: Any) -> Any:
        """Convert Python objects to JSON-serializable format"""
        # Handle None
        if obj is None:
            return None

        # Handle basic types
        if isinstance(obj, (bool, int, float, str)):
            return obj

        # Handle bytes
        if isinstance(obj, bytes):
            return {
                "__type__": "bytes",
                "__value__": list(obj)  # Convert to list of integers
            }

        # Handle lists and tuples
        if isinstance(obj, (list, tuple)):
            return [self._serialize(item) for item in obj]

        # Handle dictionaries
        if isinstance(obj, dict):
            return {k: self._serialize(v) for k, v in obj.items()}

        # Handle sets
        if isinstance(obj, set):
            return {
                "__type__": "set",
                "__value__": [self._serialize(item) for item in obj]
            }

        # Handle datetime
        try:
            from datetime import datetime, date, time
            if isinstance(obj, (datetime, date, time)):
                return {
                    "__type__": "datetime",
                    "__value__": obj.isoformat()
                }
        except ImportError:
            pass

        # Handle callable objects (functions, methods)
        if callable(obj):
            return {
                "__type__": "function" if not inspect.ismethod(obj) else "method",
                "__name__": getattr(obj, "__name__", "<anonymous>"),
                "__module__": getattr(obj, "__module__", None),
                "__async__": inspect.iscoroutinefunction(obj)
            }

        # Handle classes
        if inspect.isclass(obj):
            return {
                "__type__": "class",
                "__name__": obj.__name__,
                "__module__": obj.__module__
            }

        # For other objects, try to return a useful representation
        try:
            # Try to convert to dict if object has __dict__
            if hasattr(obj, "__dict__"):
                return {
                    "__type__": "object",
                    "__class__": obj.__class__.__name__,
                    "__module__": obj.__class__.__module__,
                    "__repr__": str(obj),
                    "__dict__": {k: self._serialize(v) for k, v in obj.__dict__.items() if not k.startswith('_')}
                }
            else:
                return {
                    "__type__": "object",
                    "__class__": obj.__class__.__name__,
                    "__repr__": str(obj)
                }
        except Exception:
            # Last resort: return string representation
            return {
                "__type__": "unknown",
                "__repr__": str(obj)
            }

    def start(self, socket_name: str = "ezlang-python-bridge"):
        """Start the IPC server"""
        self.server.listen(socket_name)

        @self.server.on("import")
        def handle_import(data):
            return self.import_module(
                data["module"],
                data.get("auto_install", True)
            )

        @self.server.on("install")
        def handle_install(data):
            return self.install_package(data["package"])

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

        @self.server.on("create_instance")
        def handle_create_instance(data):
            return self.create_instance(
                data["module"],
                data["class"],
                data.get("args", [])
            )

        @self.server.on("call_method")
        def handle_call_method(data):
            return self.call_method(
                data["instance_id"],
                data["method"],
                data.get("args", [])
            )

        print(f"Python bridge listening on {socket_name}", flush=True)
        self.server.start()


if __name__ == "__main__":
    try:
        bridge = PythonBridge()
        bridge.start()
    except Exception as e:
        print(f"Error starting Python bridge: {e}", file=sys.stderr, flush=True)
        traceback.print_exc()
        sys.exit(1)
