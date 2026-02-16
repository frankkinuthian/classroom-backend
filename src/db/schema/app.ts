import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const timestamps = {
  // Auto-set when row is created.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Auto-update whenever the row changes.
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export const departments = pgTable("departments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),

  ...timestamps,
});

export const subjects = pgTable("subjects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  departmentId: integer("department_id")
    .notNull()
    .references(() => departments.id, { onDelete: "restrict" }),

  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),

  ...timestamps,
});

export const departmentsRelations = relations(departments, ({ many }) => ({
  // One department can have many subjects.
  subjects: many(subjects),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  // Each subject belongs to exactly one department.
  department: one(departments, {
    // Foreign key on subjects table.
    fields: [subjects.departmentId],
    // Primary key on departments table.
    references: [departments.id],
  }),
}));

// Row shape returned when reading from departments.
export type Department = typeof departments.$inferSelect;
// Payload shape expected when creating/updating departments.
export type NewDepartment = typeof departments.$inferInsert;

// Row shape returned when reading from subjects.
export type Subject = typeof subjects.$inferSelect;
// Payload shape expected when creating/updating subjects.
export type NewSubject = typeof subjects.$inferInsert;
