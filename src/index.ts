import { eq } from "drizzle-orm";
import { db, pool } from "./db/index.js";
import { departments } from "./db/schema/index.js";

/**
 * Performs a demo CRUD sequence on the `demoUsers` table and manages resources.
 *
 * Inserts a user, reads it back, updates its name, deletes it, logs each step, exits the process on error, and closes the database pool in all cases.
 */
async function main() {
  try {
    console.log("Performing CRUD operations...");
    const demoDepartmentCode = "ADMIN-DEMO";

    const [existingDepartment] = await db
      .select({ id: departments.id })
      .from(departments)
      .where(eq(departments.code, demoDepartmentCode))
      .limit(1);

    if (existingDepartment) {
      await db
        .delete(departments)
        .where(eq(departments.id, existingDepartment.id));
      console.log(
        `CLEANUP: Removed existing department with code ${demoDepartmentCode}.`,
      );
    }

    const [newDepartment] = await db
      .insert(departments)
      .values({
        code: demoDepartmentCode,
        name: "Administration",
        description: "Demo department for CRUD testing",
      })
      .returning();

    if (!newDepartment) {
      throw new Error("Failed to create department");
    }

    console.log("CREATE: New department created:", newDepartment);

    const foundDepartment = await db
      .select()
      .from(departments)
      .where(eq(departments.id, newDepartment.id));
    console.log("READ: Found department:", foundDepartment[0]);

    const [updatedDepartment] = await db
      .update(departments)
      .set({ name: "Administration Updated" })
      .where(eq(departments.id, newDepartment.id))
      .returning();

    if (!updatedDepartment) {
      throw new Error("Failed to update department");
    }

    console.log("UPDATE: Department updated:", updatedDepartment);

    await db.delete(departments).where(eq(departments.id, newDepartment.id));
    console.log("DELETE: Department deleted.");

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