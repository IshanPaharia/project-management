import { Inngest } from "inngest";
import { prisma } from "../db.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "project-management-0210" });

// Inngest function to add user to database
const syncUserCreation = inngest.createFunction(
    {
        id: "sync-user-with-clerk",
    },
    {
        event: "clerk/user.created",
    },
    async ({ event, step }) => {
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
    },
    {
        event: "clerk/user.deleted",
    },
    async ({ event, step }) => {
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
    },
    {
        event: "clerk/user.updated",
    },
    async ({ event, step }) => {
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

// Create an array where we'll export Inngest functions
export const functions = [syncUserCreation, syncUserUpdate, syncUserDelete];