import express from "express";
import { addMemberToWorkspace, getUserWorkspaces } from "../controllers/workspaceController.js";
import { protect } from "../middleware/authMiddleware.js";

const wrouter = express.Router();

wrouter.use(protect); // Protect all routes in this router

wrouter.get("/", getUserWorkspaces);
wrouter.post("/add-member", addMemberToWorkspace);

export default wrouter;