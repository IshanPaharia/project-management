import { Inngest } from "inngest";
import { prisma } from "../db.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "project-management-0210" });

// Inngest function to add user to database
const syncUserCreation = inngest.createFunction(
    {
        id: "sync-user-with-clerk",
        triggers: { event: "clerk/user.created" },
    },
    async ({ event, step, runId }) => {
        const user = event.data;

        await step.run("sync-user-to-db", async () => {
            await prisma.user.create({
                data: {
                    id: user.id,
                    email: user.email_addresses[0]?.email_address,
                    name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "Unknown",
                    image: user.image_url,
                },
            });
        });
    }
);

// Inngest function to delete user from database
const syncUserDelete = inngest.createFunction(
    {
        id: "delete-user-with-clerk",
        triggers: { event: "clerk/user.deleted" },
    },
    async ({ event, step, runId }) => {
        const user = event.data;

        await step.run("delete-user-from-db", async () => {
            await prisma.user.delete({
                where: {
                    id: user.id,
                },
            });
        });
    }
);

// Inngest function to update user in database
const syncUserUpdate = inngest.createFunction(
    {
        id: "update-user-with-clerk",
        triggers: { event: "clerk/user.updated" },
    },
    async ({ event, step, runId }) => {
        const user = event.data;

        await step.run("update-user-to-db", async () => {
            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    email: user.email_addresses[0]?.email_address,
                    name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "Unknown",
                    image: user.image_url,
                },
            });
        });
    }
);

// Inngest function to create workspace
const createWorkspace = inngest.createFunction(
    {
        id: "create-workspace",
        triggers: { event: "clerk/organization.created" },
    },
    async ({ event, step, runId }) => {
        const workspace = event.data;

        await step.run("create-workspace-in-db", async () => {
            await prisma.workspace.create({
                data: {
                    id: workspace.id,
                    name: workspace.name,
                    slug: workspace.slug,
                    ownerId: workspace.created_by,
                    image_url: workspace.image_url,
                },
            });

            // Add ceator as ADMIN
            await prisma.workspaceMember.create({
                data: {
                    userId: workspace.created_by,
                    workspaceId: workspace.id,
                    role: "ADMIN",
                },
            });
        });
    }
);

// Inngest function to update workspace
const updateWorkspace = inngest.createFunction(
    {
        id: "update-workspace",
        triggers: { event: "clerk/organization.updated" },
    },
    async ({ event, step, runId }) => {
        const workspace = event.data;

        await step.run("update-workspace-in-db", async () => {
            await prisma.workspace.update({
                where: {
                    id: workspace.id,
                },
                data: {
                    name: workspace.name,
                    slug: workspace.slug,
                    image_url: workspace.image_url,
                },
            });
        });
    }
);

// Inngest function to delete workspace
const deleteWorkspace = inngest.createFunction(
    {
        id: "delete-workspace",
        triggers: { event: "clerk/organization.deleted" },
    },
    async ({ event, step, runId }) => {
        const workspace = event.data;

        await step.run("delete-workspace-in-db", async () => {
            await prisma.workspace.delete({
                where: {
                    id: workspace.id,
                },
            });
        });
    }
);

// Inngest function to update workspace member
const createWorkspaceMember = inngest.createFunction(
    {
        id: "create-workspace-member",
        triggers: { event: "clerk/organizationInvitation.created" },
    },
    async ({ event, step, runId }) => {
        const workspaceMember = event.data;

        await step.run("create-workspace-member-in-db", async () => {
            await prisma.workspaceMember.create({
                data: {
                    userId: workspaceMember.user_id,
                    workspaceId: workspaceMember.organization_id,
                    role: String(workspaceMember.role_name).toUpperCase(),
                },
            });
        });
    }
);

// Create an array where we'll export Inngest functions
export const functions = [
    syncUserCreation,
    syncUserUpdate,
    syncUserDelete,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    createWorkspaceMember
];