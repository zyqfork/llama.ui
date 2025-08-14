# 🧠 Copilot Coding Agent Instructions

## 🗂️ High-Level Overview

- **Purpose**: `llama.ui` is a front-end UI project built with React and Tailwind CSS, likely intended to serve as a modular, component-driven interface layer for a larger application.
- **Project Type**: Web application (React-based)
- **Languages**:
  - TypeScript (primary)
  - SCSS (minor usage)
- **Frameworks & Tooling**:
  - React (functional components with hooks)
  - Tailwind CSS (via `tailwind.config.js`)
  - DaisyUI for theming
  - Vite (build tool, configured in `vite.config.ts`)
  - ESLint (via `eslint.config.js`)
  - Prettier (via `.prettierignore`)
- **Runtime**: Node.js (v22+ recommended)

## ⚙️ Build & Validation Instructions

> ✅ Always run `npm ci` before any build or test step.

### 🔧 Bootstrap

```bash
npm ci
```

- Installs all dependencies.
- Required before any other step.
- If you encounter `ERR_MODULE_NOT_FOUND`, ensure you're using Node.js v22+ and clean `node_modules`.

### 🏗️ Build

```bash
npm run build
```

- Uses Vite to compile the project.
- Output is placed in the `dist/` folder.
- Requires successful linting and type-checking.

### 🧪 Test

> ⚠️ No test framework or scripts currently defined in `package.json`.

- If adding tests, prefer `vitest` or `jest` with TypeScript support.
- Place tests in `src/__tests__` or co-located with components.

### 🚀 Run Locally

```bash
npm start
```

- Starts the Vite dev server.
- Accessible at `http://localhost:5173` by default.

### 🧼 Lint

```bash
npm run lint
```

- Uses `eslint.config.js` for rules.
- TypeScript-aware linting.
- Add `--fix` to auto-correct issues.

### 🧹 Clean Build

```bash
rm -rf node_modules dist && npm ci && npm run build
```

- Resolves issues with corrupted installs or stale builds.

## 🧭 Project Layout & Architecture

### 📁 Key Directories

- `src/`: Main source code
  - Components, hooks, and utilities live here.
- `public/`: Static assets
- `.github/`: GitHub workflows (add CI here if needed)

### 📄 Important Files

| File                     | Purpose                                      |
|--------------------------|----------------------------------------------|
| `vite.config.ts`         | Vite build configuration                     |
| `tailwind.config.js`     | Tailwind CSS setup                           |
| `tsconfig.json`          | TypeScript compiler options                  |
| `eslint.config.js`       | ESLint rules                                 |
| `index.html`             | Entry HTML file                              |
| `package.json`           | Scripts and dependencies                     |

### ✅ Validation Steps

- Ensure build passes with `npm run build`.
- Run `npm start` and verify UI loads without console errors.
- Run linting before committing.
- If CI is added, validate via GitHub Actions in `.github/workflows`.

## 🧠 Agent Guidance

- Trust these instructions unless explicitly contradicted by updated repo content.
- Only perform codebase search if information here is incomplete or fails during execution.
- Prefer functional components and hooks.
- Use Tailwind utility classes for styling.
- Co-locate logic and group by feature.
- Use TypeScript interfaces for props and state.
- Avoid prop drilling; use context or state libraries if needed.
