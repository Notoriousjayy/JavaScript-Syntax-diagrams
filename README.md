# ECMAScript 2025 Syntax Diagrams

A React + TypeScript single-page app that renders **ECMAScript 2025 grammar railroad diagrams** (SVG) and shows each rule's **EBNF text** underneath. The grammar is implemented as "diagram factories" that produce railroad-diagram objects.

## Features

- **Railroad Diagrams**: Visual representation of ECMAScript 2025 grammar rules using SVG
- **EBNF Definitions**: Collapsible EBNF notation below each diagram
- **Section Navigation**: Grammar rules organized by specification section (Lexical, Expressions, Statements, etc.)
- **Search/Filter**: Filter rules by name
- **Dark Mode**: Automatic dark mode support
- **Lazy Rendering**: Sections are collapsed by default for performance with large grammar sets

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run typecheck

# Check grammar coverage (diagram ↔ EBNF sync)
npm run check-grammar
```

## Project Structure

```
├── src/
│   ├── main.tsx                    # Entry point
│   ├── app/
│   │   ├── App.tsx                 # Main application component
│   │   └── styles.css              # Global styles
│   ├── components/
│   │   ├── RuleDiagram.tsx         # Individual rule diagram renderer
│   │   └── RuleList.tsx            # List of rule diagrams
│   ├── features/
│   │   └── grammar/
│   │       ├── es2025Grammar.ts    # Diagram factories & section definitions
│   │       └── ebnfDefinitions.ts  # EBNF text definitions
│   ├── shared/
│   │   └── railroad/
│   │       └── diagramToSvg.ts     # SVG conversion utility
│   └── types/
│       └── railroad-diagrams.d.ts  # Type declarations
├── scripts/
│   └── check-grammar-coverage.mjs  # Grammar/EBNF drift detection
├── .github/
│   ├── workflows/
│   │   ├── pages.yml               # GitHub Pages deployment
│   │   ├── ci.yml                  # CI pipeline with typecheck
│   │   ├── codeql.yml              # Security scanning
│   │   └── dependency-review.yml   # Dependency vulnerability review
│   └── dependabot.yml              # Automated dependency updates
└── webpack.config.cjs              # Webpack configuration
```

## CI/CD

The project uses GitHub Actions for:

1. **Type Safety**: `npm run typecheck` runs before every build
2. **Grammar Coverage**: `npm run check-grammar` ensures diagram factories and EBNF definitions stay in sync
3. **Security Scanning**: CodeQL analysis on push/PR and weekly schedule
4. **Dependency Review**: Checks PRs for vulnerable dependencies
5. **Automated Deployment**: GitHub Pages deployment on push to main

## Development Notes

### Adding New Grammar Rules

1. Add the diagram factory in `src/features/grammar/es2025Grammar.ts`:
   ```typescript
   rules.set("MyNewRule", () =>
     Diagram(
       Sequence(T("keyword"), NT("Identifier"))
     )
   );
   ```

2. Add the EBNF definition in `src/features/grammar/ebnfDefinitions.ts`:
   ```typescript
   "MyNewRule": `MyNewRule :
       keyword Identifier`,
   ```

3. Add the rule to the appropriate section in `SECTION_RULES`

4. Run `npm run check-grammar` to verify coverage

### SVG Trust Boundary

The `RuleDiagram` component uses `dangerouslySetInnerHTML` to render SVG. This is safe because:
- SVG is generated locally from deterministic factories
- No untrusted user input is processed
- If external grammar loading is added in the future, implement defensive sanitization

## Grammar Coverage

This project covers the ECMAScript 2025 grammar including:

- **A.1 Lexical Grammar**: Source text, input elements, whitespace, comments, tokens, identifiers, literals
- **A.2 Expressions**: Primary, member, call, optional chaining, update, unary, binary, conditional, assignment
- **A.3 Statements**: Block, variable, if, iteration, switch, try/catch, labelled, debugger
- **A.4 Functions and Classes**: Function declarations/expressions, arrow functions, generators, async functions, classes
- **A.5 Scripts and Modules**: Script, module, import/export declarations

## References

- [ECMAScript 2025 Language Specification](https://tc39.es/ecma262/)
- [ECMA-262 Annex A Grammar Summary](https://tc39.es/ecma262/#sec-grammar-summary)
- [Railroad Diagram (Wikipedia)](https://en.wikipedia.org/wiki/Syntax_diagram)

## License

MIT
