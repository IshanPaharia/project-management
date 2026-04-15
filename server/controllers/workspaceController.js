import { prisma } from "../db.js";

// Get all workspaces for a user
export const getUserWorkspaces = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const workspaces = await prisma.workspace.findMany({
            where: {
                members: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: true
                    }
                },
                projects: {
                    include: {
                        tasks: {
                            include: {
                                assignee: true,
                                comments: {
                                    include: {
                                        user: true
                                    }
                                }
                            }
                        },
                        owner: true
                    }
                }
            }
        });
        res.json({workspaces});
    } catch (error) {
        console.error("Error fetching workspaces:", error);
        res.status(500).json({ error: "Failed to fetch workspaces" });
    }
};

// Add member to workspace
export const addMemberToWorkspace = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { workspaceId, email, role, message } = req.body;
        
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if(!workspaceId || !role) {
            return res.status(400).json({ error: "Workspace ID and role are required" });
        }

        if(!["ADMIN", "MEMBER"].includes(role)) {
            return res.status(400).json({ error: "Invalid role" });
        }

        // fetch workspace
        const workspace = await prisma.workspace.findUnique({
            where: {
                id: workspaceId,
            },
            include: {
                members: true
            }
        });
        if (!workspace) {
            return res.status(404).json({ error: "Workspace not found" });
        }

        // check if user is owner
        if(workspace.ownerId !== userId) {
            return res.status(403).json({ error: "User is not the owner of this workspace" });
        }

        // check if user is already a member
        const existingMember = workspace.members.find((member) => member.userId === user.id)
        
        if (existingMember) {
            return res.status(400).json({ error: "User is already a member of this workspace" });
        }

        // add member to workspace
        const workspaceMember = await prisma.workspaceMember.create({
            data: {
                userId: user.id,
                workspaceId,
                role,
                message,
            },
        });
        res.json({ workspaceMember });

    } catch (error) {
        console.error("Error adding member to workspace:", error);
        res.status(500).json({ error: "Failed to add member to workspace" });
    }
};