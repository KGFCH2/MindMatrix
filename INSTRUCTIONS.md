# 📖 MindMatrix - Working Principles and User Guidance

This document provides a comprehensive overview of the technical architecture and user-facing workflows of the MindMatrix application. 🧩

## 🏗️ Application Architecture

The application follows a modern **Full-Stack SPA** architecture:

- **Frontend**: A reactive, motion-heavy SPA built with React 18 and Vite.
- **Backend**: A robust Express.js server that handles high-complexity Sudoku operations and serves static assets.
- **Shared Logic**: The Sudoku engine is written in pure TypeScript, allowing it to be shared across the stack for consistency.

## 📂 File-by-File Working Principles

### 🏠 Root Files

- **`server.ts`** 🖥️: The backend backbone. Orchestrates Express.js middleware, routes API requests for complex grid analysis, and ensures the production build is served correctly.
- **`package.json`** 📦: The project manifest. Definitive list of dependencies including `framer-motion` for animations and `canvas-confetti` for victory effects.
- **`vite.config.ts`** ⚡: Lightning-fast build configuration tailored for React and TypeScript.
- **`tailwind.config.js`** 🎨: Custom theme definitions, including our specific "cosmic" color palette and typography settings.

### 🍱 Frontend (`/src`)

- **`main.tsx`** 🚩: The React bridge. Mounts the application and initializes the `AnimatePresence` for route transitions.
- **`App.tsx`** 🗺️: The Global Controller. Manages routing, the "cosmic" theme toggle, and the sticky navigation/footer layout.
- **`index.css`** 🖌️: The style registry. Houses Tailwind 4.0 directives and the unique **Cambria Math** / **Comic Sans MS** font declarations.

#### 📄 Pages (`/src/pages`)

- **`Home.tsx`** 🏠: The feature showcase. High-energy entrance into the MindMatrix universe.
- **`Solver.tsx`** 🧩: The "Command Center".
  - **Logic**: Integrates the backtracking solver with the React state.
  - **Victory**: Triggers the **extreme 200px blur** and trophy modal when `isGridCompleteAndValid` returns true.
  - **Interactions**: Handles keyboard navigation and cell-specific validation.
- **`Learn.tsx`** 🎓: The Sudoku Academy. Interactive guide to advanced solving strategies with difficulty-graded content.
- **`FAQ.tsx`** ❓: Dynamic support center with accordion-based animations.

#### 🧠 Library (`/src/lib`)

- **`sudoku.ts`** ⚙️: The Mathematical Core.
  - **Backtracking**: The recursive engine used for both solving and generating valid puzzles.
  - **Analytics**: Calculates puzzle entropy to determine "Easy", "Medium", or "Hard" ratings.
  - **Hints**: A logic-path generator that identifies the "simplest" next step for the player.

## 🎮 User Guidance

### 🛠️ Working the Solver

1. **Grid Setup**: Toggle between **6x6** (Fast & Fun) or **9x9** (Classic & Hard) grids. 📐
2. **Input Flow**: Type numbers from 1-9. Incorrect entries glow **Red**, while correct logic lights up **Green**.
3. **AI Assistance**:
    - **Get Hint**: Reveals the next logical cell with an explanation. 💡
    - **Animate Solve**: Watch the AI "think" through the grid path. 🎭
4. **The Trophy Screen**: When you solve the grid, the background will **blur completely (200px)** to focus entirely on your achievement. 🏆

### 🎨 Visual Customization

The **Theme Toggle** in the top-right is more than just a switch:

- Hover to see the **Cosmic Shockwave**.
- Tap for a high-speed **Icon Morph**.
- The bottom edge features a **Glowing Shade** that pulses with color. 🔋

### 📈 Progression

Start with **Easy 6x6** boards to learn the interface, then jump into the **Learn** page to master "Naked Pairs" before tackling the **Hard 9x9** Masterpieces. 🏔️

---

### 👨‍💻 Created by

**MindMatrix** is created by **Babin Bid**. Licensed under the [MIT License](LICENSE).

- **📧 Mail**: [babinbid05@gmail.com](mailto:babinbid05@gmail.com)
- **🔗 LinkedIn**: [babinbid123](https://www.linkedin.com/in/babinbid123/)
- **💻 GitHub**: [KGFCH2](https://github.com/KGFCH2)
