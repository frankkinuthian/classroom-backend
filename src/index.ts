import { eq } from "drizzle-orm";
import { db, pool } from "./db/index.js";
import { demoUsers } from "./db/schema/index.js";

/**
 * Performs a demo CRUD sequence on the `demoUsers` table and manages resources.
 *
 * Inserts a user, reads it back, updates its name, deletes it, logs each step, exits the process on error, and closes the database pool in all cases.
 */
async function main() {
  try {
    console.log("Performing CRUD operations...");

    const [newUser] = await db
      .insert(demoUsers)
      .values({ name: "Admin User", email: "admin@example.com" })
      .returning();

    if (!newUser) {
      throw new Error("Failed to create user");
    }

    console.log("CREATE: New user created:", newUser);

    const foundUser = await db
      .select()
      .from(demoUsers)
      .where(eq(demoUsers.id, newUser.id));
    console.log("READ: Found user:", foundUser[0]);

    const [updatedUser] = await db
      .update(demoUsers)
      .set({ name: "Super Admin" })
      .where(eq(demoUsers.id, newUser.id))
      .returning();

    if (!updatedUser) {
      throw new Error("Failed to update user");
    }

    console.log("UPDATE: User updated:", updatedUser);

    await db.delete(demoUsers).where(eq(demoUsers.id, newUser.id));
    console.log("DELETE: User deleted.");

    console.log("CRUD operations completed successfully.");
  } catch (error) {
    console.error("Error performing CRUD operations:", error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      console.log("Database pool closed.");
    }
  }
}

main();