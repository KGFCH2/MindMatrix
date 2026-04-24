# 🧩 MindMatrix | Master the Sudoku Grid

MindMatrix is a modern, high-performance Sudoku application powered by advanced backtracking algorithms and an eccentric, playful design. It offers a seamless experience for solving, learning, and generating Sudoku puzzles with a focus on visual feedback and "mind-blowing" interactive elements. 🚀

## ✨ Key Features

- **🧠 Advanced AI Solver**: Instantly solve any valid Sudoku puzzle using our optimized backtracking engine.
- **⚡ Real-time Validation**: Get immediate, high-fidelity feedback with red/green color coding as you navigate the grid.
- **📏 Flexible Grid Sizes**: Support for both 6x6 (beginner) and 9x9 (master) Sudoku grids.
- **🎲 Puzzle Generation**: Infinite puzzle variety across three difficulty levels: **Easy**, **Medium**, and **Hard**.
- **🎭 Step Visualization**: "Animate Solve" lets you watch the AI traverse the search tree in real-time with smooth motion.
- **💡 Smart Hints**: Get logical suggestions for your next move without spoiling the entire puzzle.
- **🌗 Cosmic Dark/Light Mode**: A highly animated, high-speed toggle with morphing icons and glowing "shockwave" effects.
- **🏆 Masterpiece Celebration**: An immersive, full-page victory experience with extreme 200px background blur and cascading confetti.

## 🎨 Design Philosophy

MindMatrix breaks the mold of generic Sudoku apps with a **"Playful & Technical"** aesthetic:

- **Typography**: A striking mix of **Cambria Math** for authoritative headings and **Comic Sans MS** for an approachable, playful UI.
- **Interactivity**: Every button and toggle is engineered for maximum kinetic feedback, utilizing `motion` for physics-based animations.
- **Immersion**: When you win, the app takes over the entire screen with an extreme blur effect, isolating your achievement from the rest of the world. 🌫️

## 🛠️ Tech Stack

- **⚛️ Frontend**: React 18, TypeScript, Vite
- **🎨 Styling**: Tailwind CSS 4.0+
- **🎬 Animations**: Motion (React)
- **💎 Icons**: Lucide React
- **🌐 Backend**: Express.js (Node.js)
- **📡 API**: Axios
- **🎉 Effects**: Canvas Confetti

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher) 🟢
- npm (comes with Node.js) 📦

### Step-by-Step Setup Instructions

#### Step 1: Prepare Your Environment

1. **Install Node.js** (if not already installed):
   - Visit [nodejs.org](https://nodejs.org)
   - Download the LTS version (v18 or higher)
   - Follow the installation wizard for your operating system
   - Verify installation:

     ```bash
     node --version
     npm --version
     ```

#### Step 2: Project Setup

1. **Navigate to the project directory**:

   ```bash
   cd MindMatrix
   ```

2. **Install all dependencies**:

   ```bash
   npm install
   ```

   This downloads and installs all required packages from `package.json`

#### Step 3: Environment Configuration

1. **Copy the example environment file**:

   ```bash
   cp .env.example .env
   ```

2. **Configure API keys** (if needed):
   - Edit the `.env` file with your text editor
   - Add any required API keys or configuration values
   - **Note**: Keep `.env` file private and never commit it to version control

#### Step 4: Development Server

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Open in browser**:
   - The server will start at `http://localhost:5173` (or another port if 5173 is busy)
   - A local URL will be displayed in the terminal

#### Step 5: Development Workflow

- **Edit files** in the `/src` directory
- **Changes auto-reload** in the browser (Hot Module Replacement)
- **Check for errors**:

  ```bash
  npm run lint
  ```

#### Step 6: Build for Production

1. **Create an optimized production build**:

   ```bash
   npm run build
   ```

   This generates a `/dist` folder with minified, optimized files

2. **Preview the production build locally**:

   ```bash
   npm run preview
   ```

3. **Deploy the `/dist` folder** to your hosting platform (Netlify, Vercel, AWS, etc.)

### Common Commands Reference

| Command | Purpose |
| --------- | --------- |
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create optimized production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Check TypeScript for errors |
| `npm run clean` | Remove the `/dist` build folder |

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Port 5173 already in use?**

- The dev server will automatically try the next available port
- Check the terminal output for the actual URL

**Dependencies installation fails?**

- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again

**TypeScript errors?**

- Run `npm run lint` to see detailed error messages
- Check that all files are saved
- Ensure your IDE's TypeScript support is enabled

**Build fails?**

- Clear the dist folder: `npm run clean`
- Try building again: `npm run build`
- Check the terminal output for specific error messages

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Experience the Grid**: Open your browser and navigate to `http://localhost:3000`. 🌐

## 🎮 How to Play

- **Solve**: Input numbers manually or use the "Solve Instantly" button for immediate results.
- **Animate**: Use "Animate Solve" to visualize the algorithmic "thinking" process.
- **Generate**: Select your favorite difficulty and grid size to start a fresh challenge.
- **Learn**: Dive into the "Learn" page to master techniques like "Naked Pairs" or "Hidden Singles".

## 🛡️ Privacy & Terms

We value your privacy. MindMatrix is built with transparency. Check out our internal Privacy Policy and Terms of Service pages for more info. 🔒

## ✉️ Contact & Credits

**MindMatrix** is created with ❤️ by **Babin Bid**. Feel free to reach out for collaborations or feedback!

- **📧 Mail**: [babinbid05@gmail.com](mailto:babinbid05@gmail.com)
- **🔗 LinkedIn**: [babinbid123](https://www.linkedin.com/in/babinbid123/)
- **💻 GitHub**: [KGFCH2](https://github.com/KGFCH2)

---
*Developed by Babin Bid. Playful & Technical.*
