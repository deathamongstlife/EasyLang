# EasyLang (EzLang)

## Project Overview

EasyLang (EzLang) is a domain-specific programming language designed specifically to make creating Discord bots accessible to beginners while providing power users with professional-grade features. It features a custom, beginner-friendly syntax inspired by Python and JavaScript.

**Key Features:**
- **Custom Interpreter:** Implemented in TypeScript, including a lexer, parser, and runtime environment.
- **Discord Integration:** First-class support for Discord bot development (powered by Discord.js) with over 148+ built-in functions.
- **Dual Bridge System:** Seamless integration allowing the use of both Python packages (via an IPC bridge) and npm packages directly within EzLang scripts.
- **Interactive REPL:** A command-line interactive learning and rapid prototyping environment.

The project is structured with the core language implementation in TypeScript (Node.js) and a Python runtime component (`python-runtime/`) to handle the Python bridge.

## Building and Running

### Prerequisites
- Node.js 16 or higher
- Python 3.8 or higher
- npm or yarn

### Setup
1. Install Node.js dependencies:
   ```bash
   npm install
   ```
2. Install Python dependencies for the bridge:
   ```bash
   pip install -r python-runtime/requirements.txt
   ```

### Build & Execution
- **Build the project:**
  ```bash
  npm run build
  ```
- **Start the REPL (Interactive Mode):**
  ```bash
  npm run dev
  # or
  npm run start:repl
  ```
- **Run an EzLang script:**
  ```bash
  node dist/index.js run <path/to/script.ez>
  # or if installed globally:
  ezlang run <path/to/script.ez>
  ```

### Testing
The project uses Jest for testing.
- **Run all tests:**
  ```bash
  npm test
  ```
- **Run tests with coverage:**
  ```bash
  npm run test:coverage
  ```
- **Run specific subsystem tests:**
  - Lexer: `npm run test:lexer`
  - Runtime: `npm run test:runtime`
  - Discord integration: `npm run test:discord`
  - Python bridge: `npm run test:python`

## Development Conventions

- **Language:** TypeScript (`src/**/*.ts`).
- **Code Style:** Enforced via Prettier.
  - Check formatting: `npm run format:check`
  - Fix formatting: `npm run format`
- **Linting:** Enforced via ESLint.
  - Run linter: `npm run lint`
  - Fix lint issues: `npm run lint:fix`
- **Testing:** Write tests using Jest. Test files are typically located in `tests/` or `src/__tests__/` directories.
- **Documentation:** High-level project documentation is maintained in Markdown files in the root and `docs/` directories. Code examples can be found in the `examples/` directory.
