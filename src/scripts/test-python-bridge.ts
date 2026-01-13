import { PythonBridge } from '../python/index.js';

async function testPythonBridge() {
  console.log('🐍 Testing Python Bridge...\n');

  const bridge = new PythonBridge();

  try {
    // Initialize
    console.log('1. Initializing Python bridge...');
    await bridge.initialize();

    if (!bridge.isInitialized()) {
      console.error('❌ Python bridge failed to initialize');
      console.error('   This is expected if Python or IPC package is not installed');
      console.error('   To fix: pip3 install ipc --break-system-packages');
      process.exit(1);
    }

    console.log('✅ Python bridge initialized\n');

    // Test math module
    console.log('2. Importing math module...');
    await bridge.importModule('math');
    console.log('✅ Math module imported\n');

    // Test attribute access (constants)
    console.log('3. Getting math.pi...');
    const pi = await bridge.getAttribute('math', ['pi']);
    console.log(`✅ math.pi = ${pi}\n`);

    // Test function call - sqrt
    console.log('4. Calling math.sqrt(144)...');
    const sqrtResult = await bridge.callFunction('math', 'sqrt', [144]);
    console.log(`✅ math.sqrt(144) = ${sqrtResult}\n`);

    // Test function call - factorial
    console.log('5. Calling math.factorial(5)...');
    const factorialResult = await bridge.callFunction('math', 'factorial', [5]);
    console.log(`✅ math.factorial(5) = ${factorialResult}\n`);

    // Test random module
    console.log('6. Testing random module...');
    await bridge.importModule('random');
    const randInt = await bridge.callFunction('random', 'randint', [1, 100]);
    console.log(`✅ random.randint(1, 100) = ${randInt}\n`);

    // Test getting multiple attributes
    console.log('7. Testing math.e constant...');
    const e = await bridge.getAttribute('math', ['e']);
    console.log(`✅ math.e = ${e}\n`);

    console.log('🎉 All tests passed!');
    console.log('\nPython bridge is fully functional and ready to use.');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Ensure Python 3 is installed: python3 --version');
    console.error('2. Install IPC package: pip3 install ipc --break-system-packages');
    console.error('3. Check that bridge.py exists in python-runtime/');
    process.exit(1);
  } finally {
    await bridge.cleanup();
  }
}

testPythonBridge();
