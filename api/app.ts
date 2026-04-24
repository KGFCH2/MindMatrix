import express from "express";
import { solveSudoku, generateSudoku, analyzeSudoku, getHint } from "../src/lib/sudoku.js";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("Environment check:", {
    hasGemini: !!process.env.GEMINI_API_KEY,
    hasGroq: !!process.env.GROQ_API_KEY,
    nodeEnv: process.env.NODE_ENV
});

const app = express();
app.use(express.json());

const getGemini = () => {
    const key = process.env.GEMINI_API_KEY?.trim().replace(/^["']|["']$/g, '');
    if (!key) return null;
    return new GoogleGenerativeAI(key);
};

const getGroq = () => {
    const key = process.env.GROQ_API_KEY?.trim().replace(/^["']|["']$/g, '');
    if (!key) return null;
    return new Groq({ apiKey: key });
};

// AI Chat Route
app.post("/api/ai/chat", async (req, res) => {
    try {
        const { message, grid } = req.body;
        
        if (!grid || !Array.isArray(grid)) {
            return res.status(400).json({ error: "Invalid grid provided" });
        }

        // Check if grid is already solved
        const { isGridCompleteAndValid } = await import("../src/lib/sudoku.js");
        if (isGridCompleteAndValid(grid)) {
          return res.json({ 
            response: "All grids are filled; nothing to recommend. Start a new game and ask me.",
            success: true 
          });
        }

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

        // HARD-CODED CHECK for Identity/Creator questions
        const lowerMsg = message.toLowerCase();
        
        // Creator Attribution
        const creatorKeywords = ["babin", "bid", "creator", "owner", "developer", "make you", "made you", "build you", "built you", "create you", "created you", "make u", "made u", "build u", "built u", "create u", "created u"];
        if (creatorKeywords.some(keyword => lowerMsg.includes(keyword))) {
          return res.json({ 
            response: "I was built by **Babin Bid**.\n\nConnect with my creator:\n\n**GitHub:** https://github.com/KGFCH2\n\n**LinkedIn:** https://www.linkedin.com/in/babinbid123/\n\n**Email:** mailto:babinbid05@gmail.com",
            success: true 
          });
        }

        // Identity Identification
        const identityKeywords = ["who are you", "what are you", "who are u", "what are u", "identify yourself", "who r u", "who r u ?", "who are you?", "who r u?"];
        if (identityKeywords.some(keyword => lowerMsg === keyword || lowerMsg.startsWith(keyword))) {
          return res.json({ 
            response: "I am **MindMatrix**, your expert Sudoku AI assistant built by **Babin Bid**. I'm here to help you solve Sudoku puzzles and provide strategic insights.",
            success: true 
          });
        }

        // Greeting Intercept
        const greetings = ["hey", "hi", "hello", "hii", "helloo", "hey there", "good morning", "good evening", "good afternoon"];
        if (greetings.some(g => lowerMsg.startsWith(g))) {
            return res.json({
                response: "Hello! I'm **MindMatrix**, your expert Sudoku AI assistant built by **Babin Bid**. How can I help you with your puzzle today?",
                success: true
            });
        }
    
        const systemPrompt = `You are MindMatrix, an expert Sudoku AI assistant built by Babin Bid.

PERSONALITY:
- You are an expert, encouraging, and helpful assistant.
- You are multilingual and can speak Bengali, Hindi, and other languages fluently.
- You respond naturally to greetings and conversational openers.

SCOPE:
1. Your primary focus is this "MindMatrix" Sudoku application, Sudoku rules, puzzle-solving strategies, grid analysis, and teaching users how to play.
2. If asked about something completely unrelated to Sudoku or this app (e.g., politics, world news, general knowledge, non-Sudoku jokes), you should politely say: "I am capable of answering only application-related questions or puzzle-solving questions."
3. DO NOT use the restricted phrase for greetings, language requests, or Sudoku learning questions. Respond to those naturally in the user's language.

SUDOKU RULES for the current ${gridSize}x${gridSize} grid:
- Only suggest digits 1 to ${maxDigit}
- Current grid state: ${JSON.stringify(grid)}

When providing hints, give clear logical reasoning.`;

    let lastGeminiError = null;
    let lastGroqError = null;


        if (gemini) {
            try {
                // Using gemini-2.0-flash which is the current stable flash model
                const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash" });
                const result = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nUser question: " + message }] }]
                });
                const responseText = result.response.text();
                console.log("Gemini response success");
                return res.json({ response: responseText, provider: "gemini", success: true });
            } catch (geminiErr: any) {
                lastGeminiError = geminiErr.message;
                console.error("Gemini API error:", geminiErr);
            }
        }

        if (groq) {
            try {
                const completion = await groq.chat.completions.create({
                    messages: [{ role: "system", content: systemPrompt }, { role: "user", content: message }],
                    model: "llama-3.3-70b-versatile", // Updating to 3.3 as 3.1 is decommissioned
                });
                console.log("Groq response success");
                return res.json({ response: completion.choices[0].message.content, provider: "groq", success: true });
            } catch (groqErr: any) {
                lastGroqError = groqErr.message;
                console.error("Groq API error:", groqErr);
            }
        }

        console.error("Both AI providers failed or were not configured");
        return res.status(503).json({ 
            error: "AI service unavailable", 
            details: {
                gemini: lastGeminiError,
                groq: lastGroqError
            }
        });
    } catch (err: any) {
        console.error("Outer Chat Catch:", err);
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
