import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import wrouter from "./routes/workspaceRoutes.js";
import projectRouter from "./routes/projectRoutes.js";
import taskRouter from "./routes/taskRoutes.js";
import { protect } from "./middleware/authMiddleware.js";
import commentRouter from "./routes/commentRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.get("/", (req, res) => {
    res.send("Server is live!");
});
app.use("/api/inngest", serve({ client: inngest, functions }));

// Routes
app.use("/api/workspaces", protect, wrouter);
app.use("/api/projects", protect, projectRouter)
app.use("/api/task", protect, taskRouter)
app.use("/api/comment", protect,commentRouter)

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
