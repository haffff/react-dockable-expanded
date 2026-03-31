# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A React dockable window/panel management library. It allows content to be arranged in panels that can be split, docked, and floated as free-floating windows. Built with TypeScript, React hooks, and styled-components.

## Commands

```bash
# Compile TypeScript in watch mode (library source → /dist)
npm run dev

# Build example app with webpack in watch mode (→ /build/main.js)
npm run dev2

# Build example app for production
npm run build2

# Serve built example on port 80
npm start
```

There are no lint or test scripts configured.

## Architecture

### Build pipeline

- **Library source**: `src/` → compiled by `tsc` → `dist/` (ESNext JS modules + `.d.ts` declarations)
- **Example app**: `example/` → bundled by webpack via Babel → `build/main.js`
- `tsconfig.json` includes only `src/index.ts`; webpack entry is `example/main.tsx`
- Path alias `@hlorenzi/react-dockable` resolves to `/dist` in both webpack and tsconfig

### Core source files (`src/`)

| File | Role |
|------|------|
| `index.ts` | Public API — re-exports everything consumers use |
| `state.ts` | Core data model: `State`, `Panel`, `Content` interfaces; layout traversal (`traverseLayout`, `getLayout`) |
| `global.ts` | Top-level hooks: `useDockable()`, `spawnFloating()`; mouse position tracking |
| `Container.tsx` | Main render component; all drag/drop, resize, and anchor interactions live here |
| `Panel.tsx` | Tab bar + panel chrome (close, hide, lock buttons) rendered per panel |
| `rect.ts` | `Rect` geometry utility class |
| `refState.ts` | `useRefState<T>` — mutable ref state that triggers re-renders via an update token counter |

### State model

- A single root `Panel` tree describes the entire dockable layout (split panels recurse horizontally or vertically)
- Floating panels are stored separately from the root tree
- Each panel holds `Content` items (tabs); the active tab is rendered
- Layout rectangles are computed by `getLayout()` / `traverseLayout()` from the root downward

### Consumer API

```tsx
// Initialize
const state = useDockable()

// Render
<Container state={state} />

// Inside a content component
const ctx = useContentContext()
ctx.setTitle("My Panel")
ctx.setPreferredSize(300, 200)

// Spawn a floating window
spawnFloating(state, <MyComponent />, "Title")
```

### Example app (`example/`)

Demonstrates the full API: three `Counter` tabs docked at full width, a `TextEditor` on the right, a `Clock` at the bottom, and buttons to spawn floating windows. Run `npm run dev2` and open `build/main.js` via `npm start`.

## Key Dependencies

- `peerDependencies`: `react ^17`, `styled-components ^5`
- `dependencies`: `react-icons ^5` (used in `Panel.tsx` for FaEye, FaLock, IoClose icons)
- Build tools: `typescript ^4.4`, `webpack ^5`, `@babel/core ^7`
