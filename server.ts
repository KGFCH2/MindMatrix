import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { solveSudoku, generateSudoku, analyzeSudoku, getHint } from "./src/lib/sudoku.ts";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const gemini = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/ai/chat", async (req, res) => {
    const { message, grid } = req.body;
    
    if (!gemini && !groq) {
      return res.status(503).json({ 
        error: "No AI API keys configured. Please set GEMINI_API_KEY or GROQ_API_KEY in your environment." 
      });
    }

    const systemPrompt = `You are GridMind, a Sudoku expert. Help the user with their puzzle. Current grid state: ${JSON.stringify(grid)}`;

    try {
      // Try Gemini first
      if (gemini) {
        try {
          const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash" });
          const result = await model.generateContent({
            contents: [
              {
                role: "user",
                parts: [
                  { text: systemPrompt + "\n\nUser question: " + message }
                ]
              }
            ]
          });
          
          const response = result.response.text();
          return res.json({ 
            response: response,
            provider: "gemini",
            success: true 
          });
        } catch (geminiErr: any) {
          console.warn("Gemini API failed, attempting fallback to Groq:", geminiErr.message);
          // Fall through to Groq
        }
      }

      // Fallback to Groq
      if (groq) {
        try {
          const completion = await groq.chat.completions.create({
            messages: [
              {
                role: "system",
                content: systemPrompt
              },
              { role: "user", content: message }
            ],
            model: "llama-3.3-70b-versatile",
          });
          
          return res.json({ 
            response: completion.choices[0].message.content,
            provider: "groq",
            success: true 
          });
        } catch (groqErr: any) {
          console.error("Groq API also failed:", groqErr.message);
          return res.status(503).json({ 
            error: "Both Gemini and Groq APIs failed. Please try again later.",
            details: groqErr.message
          });
        }
      }

      // If we reach here, no providers worked
      return res.status(503).json({ 
        error: "AI service unavailable" 
      });
    } catch (err: any) {
      console.error("Unexpected error in AI chat:", err);
      res.status(500).json({ error: "Failed to get AI response", details: err.message });
    }
  });

  app.post("/api/solve", (req, res) => {
    const { grid } = req.body;
    if (!grid) return res.status(400).json({ error: "Grid is required" });
    const result = solveSudoku(grid);
    res.json(result);
  });

  app.post("/api/generate", (req, res) => {
    const { difficulty, size } = req.body;
    const grid = generateSudoku(difficulty || "Easy", size || 6);
    // Also return the solution for real-time validation
    const solution = solveSudoku(grid);
    res.json({ grid, solution: solution.solvedGrid });
  });

  app.post("/api/analyze", (req, res) => {
    const { grid } = req.body;
    if (!grid) return res.status(400).json({ error: "Grid is required" });
    const analysis = analyzeSudoku(grid);
    res.json(analysis);
  });

  app.post("/api/hint", (req, res) => {
    const { grid } = req.body;
    if (!grid) return res.status(400).json({ error: "Grid is required" });
    const hint = getHint(grid);
    res.json(hint || { error: "No hint available" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
