import express from "express";
import { solveSudoku, generateSudoku, analyzeSudoku, getHint } from "../src/lib/sudoku.ts";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(express.json());

const getGemini = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    return new GoogleGenerativeAI(key);
};

const getGroq = () => {
    const key = process.env.GROQ_API_KEY;
    if (!key) return null;
    return new Groq({ apiKey: key });
};

// AI Chat Route
app.post("/api/ai/chat", async (req, res) => {
    const { message, grid } = req.body;
    
    const gemini = getGemini();
    const groq = getGroq();
    
    if (!gemini && !groq) {
        return res.status(503).json({ 
            error: "No AI API keys configured. Please set GEMINI_API_KEY or GROQ_API_KEY in your environment variables on Vercel." 
        });
    }

    const gridSize = grid.length;
    const maxDigit = gridSize;
    const validDigits = Array.from({length: maxDigit}, (_, i) => i + 1).join(', ');
    
    const systemPrompt = `You are GridMind, an expert Sudoku AI assistant. You are helping with a ${gridSize}x${gridSize} Sudoku puzzle.

CRITICAL RULES:
- Only suggest digits from 1 to ${maxDigit} (${validDigits})
- Never mention or suggest digits ${maxDigit + 1} or higher
- For ${gridSize}x${gridSize} grids, valid moves are only 1-${maxDigit}
- Current grid state: ${JSON.stringify(grid)}

When providing hints or solving assistance:
- Always stay within the ${maxDigit} digit range
- Explain Sudoku rules and strategies clearly
- Be encouraging and educational
- Provide step-by-step logical reasoning
- Suggest multiple possible approaches when appropriate

Remember: This is a ${gridSize}x${gridSize} puzzle, so only use digits 1-${maxDigit}!`;

    try {
        if (gemini) {
            try {
                const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash" });
                const result = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nUser question: " + message }] }]
                });
                return res.json({ response: result.response.text(), provider: "gemini", success: true });
            } catch (geminiErr: any) {
                console.error("Gemini API error:", geminiErr);
            }
        }

        if (groq) {
            try {
                const completion = await groq.chat.completions.create({
                    messages: [{ role: "system", content: systemPrompt }, { role: "user", content: message }],
                    model: "llama-3-70b-8192",
                });
                return res.json({ response: completion.choices[0].message.content, provider: "groq", success: true });
            } catch (groqErr: any) {
                console.error("Groq API error:", groqErr);
            }
        }

        return res.status(503).json({ error: "AI service unavailable" });
    } catch (err: any) {
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

export default app;
