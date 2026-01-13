# JavaScript Syntax Diagrams

Interactive railroad diagrams (syntax diagrams) for JavaScript, based on the ECMAScript 5.1 Edition specification (ECMA-262).

## Overview

This project provides a visual representation of JavaScript's grammar using railroad diagrams. These diagrams make it easier to understand the syntax structure of JavaScript by providing a graphical alternative to BNF notation.

The grammar rules are organized by specification section:
- **§6 Source Text** - Source characters
- **§7 Lexical Conventions** - Input elements, whitespace, line terminators, comments, tokens
- **§7.6 Identifiers** - Identifier names, reserved words, keywords
- **§7.7 Punctuators** - Operators and punctuation
- **§7.8 Literals (Numeric)** - Decimal and hexadecimal numbers
- **§7.8.4 String Literals** - String syntax, escape sequences
- **§7.8.5 Regular Expression Literals** - Regex syntax
- **§11 Expressions** - All expression types, operators, precedence
- **§12 Statements** - Control flow, loops, declarations, try/catch
- **§13 Function Definition** - Function declarations and expressions
- **§14 Program** - Top-level program structure

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5175`.

### Production Build

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Type Checking

```bash
npm run typecheck
```

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Webpack 5** - Bundling
- **@prantlf/railroad-diagrams** - Railroad diagram generation

## Project Structure

```
js-syntax-diagrams/
├── src/
│   ├── main.tsx                          # Entry point
│   ├── app/
│   │   ├── App.tsx                       # Main application component
│   │   └── styles.css                    # Global styles
│   ├── components/
│   │   ├── RuleDiagram.tsx               # Individual rule diagram
│   │   └── RuleList.tsx                  # List of rule diagrams
│   ├── features/
│   │   └── grammar/
│   │       └── jsGrammar.ts              # JavaScript grammar definitions
│   ├── shared/
│   │   └── railroad/
│   │       └── diagramToSvg.ts           # SVG rendering utility
│   └── types/
│       └── railroad-diagrams.d.ts        # Type declarations
├── .github/
│   ├── dependabot.yml
│   └── workflows/
│       ├── codeql.yml
│       ├── dependency-review.yml
│       └── pages.yml
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.webpack.json
└── webpack.config.cjs
```

## Grammar Coverage

This project covers the complete ECMAScript 5.1 grammar including:

- **Lexical Grammar**: Tokens, identifiers, literals, comments
- **Expressions**: Primary, member, call, unary, binary, conditional, assignment
- **Statements**: Block, variable, empty, expression, if, iteration, continue, break, return, with, switch, labelled, throw, try, debugger
- **Functions**: Declarations, expressions, parameters, body
- **Program**: Source elements structure

## References

- [ECMA-262 5.1 Edition](https://262.ecma-international.org/5.1/)
- [ECMAScript Language Specification](https://tc39.es/ecma262/)
- [Railroad Diagram (Wikipedia)](https://en.wikipedia.org/wiki/Syntax_diagram)

## License

MIT
