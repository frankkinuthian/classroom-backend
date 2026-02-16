import { eq } from "drizzle-orm";
import { db, pool } from "./db/index.js";
import { departments } from "./db/schema/index.js";

async function main() {
  try {
    console.log("Performing CRUD operations...");

    const [newDepartment] = await db
      .insert(departments)
      .values({
        code: "ADMIN-DEMO",
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
