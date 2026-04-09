import { prisma } from "../db.js";

export const getUserWorkspaces = async (req, res) => {
    try {
        const { userId } = req.auth;
        const workspaces = await prisma.workspace.findMany({
            where: {
                members: {
                    some: {
                        userId,
                    },
                },
            },
        });
        res.json(workspaces);
    } catch (error) {
        console.error("Error fetching workspaces:", error);
        res.status(500).json({ error: "Failed to fetch workspaces" });
    }
};