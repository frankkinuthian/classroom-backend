import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

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

export const classStatusEnum = pgEnum("class_status", [
  "active",
  "inactive",
  "archived",
]);

export type ClassSchedule = {
  day: string;
  startTime: string;
  endTime: string;
};

export const classes = pgTable(
  "classes",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

    subjectId: integer("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),

    teacherId: text("teacher_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),

    inviteCode: varchar("invite_code", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    bannerCldPubId: text("banner_cld_pub_id"),
    bannerUrl: text("banner_url"),
    description: text("description"),
    capacity: integer("capacity").notNull().default(50),
    status: classStatusEnum("status").notNull().default("active"),
    schedules: jsonb("schedules").$type<ClassSchedule[]>().notNull().default([]),

    ...timestamps,
  },
  (table) => [
    index("classes_subject_id_idx").on(table.subjectId),
    index("classes_teacher_id_idx").on(table.teacherId),
    uniqueIndex("classes_invite_code_unique").on(table.inviteCode),
  ],
);

export const enrollments = pgTable(
  "enrollments",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

    studentId: text("student_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    classId: integer("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),

    ...timestamps,
  },
  (table) => [
    index("enrollments_student_id_idx").on(table.studentId),
    index("enrollments_class_id_idx").on(table.classId),
    uniqueIndex("enrollments_student_id_class_id_unique").on(
      table.studentId,
      table.classId,
    ),
  ],
);

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
  // One subject can have many classes.
  classes: many(classes),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  // Each class belongs to exactly one subject.
  subject: one(subjects, {
    fields: [classes.subjectId],
    references: [subjects.id],
  }),
  // Each class belongs to exactly one teacher user.
  teacher: one(user, {
    fields: [classes.teacherId],
    references: [user.id],
  }),
  // One class can have many enrollments.
  enrollments: many(enrollments),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  // Each enrollment belongs to exactly one student user.
  student: one(user, {
    fields: [enrollments.studentId],
    references: [user.id],
  }),
  // Each enrollment belongs to exactly one class.
  class: one(classes, {
    fields: [enrollments.classId],
    references: [classes.id],
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

// Row shape returned when reading from classes.
export type Class = typeof classes.$inferSelect;
// Payload shape expected when creating/updating classes.
export type NewClass = typeof classes.$inferInsert;

// Row shape returned when reading from enrollments.
export type Enrollment = typeof enrollments.$inferSelect;
// Payload shape expected when creating/updating enrollments.
export type NewEnrollment = typeof enrollments.$inferInsert;
