import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// Routes
app.get("/", (req, res) => {
    res.send("Server is live!");
});

app.use("/api/inngest", serve({ client: inngest, functions }));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});