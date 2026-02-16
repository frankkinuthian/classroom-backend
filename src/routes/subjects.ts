import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import express from "express";
import { departments, subjects } from "../db/schema";
import { db } from "../db";

const router = express.Router();

// / Get all subjects with optional filtering & pagination
router.get("/", async (req, res) => {
  try {
    const { search, department, page = 1, limit = 10 } = req.query;
    // Parse query params defensively and clamp to sane minimums.
    const currentPage = Math.max(1, +page);
    const limitPerPage = Math.max(1, +limit);
    const offset = (currentPage - 1) * limitPerPage;

    // Collect dynamic WHERE conditions, then combine with AND below.
    const filterConditions = [];

    // Search matches subject name or subject code.
    if (search) {
      filterConditions.push(
        or(
          ilike(subjects.name, `%${search}%`),
          ilike(subjects.code, `%${search}%`),
        ),
      );
    }

    // Department filter is applied against department name via the join.
    if (department) {
      filterConditions.push(ilike(departments.name, `%${department}%`));
    }

    // When no filters are provided, leave WHERE undefined to return all rows.
    const whereClause =
      filterConditions.length > 0 ? and(...filterConditions) : undefined;

    // Count query mirrors the same join/filter so pagination totals stay accurate.
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause);

    const totalCount = countResult[0]?.count ?? 0;

    // Fetch page data with department nested under each subject row.
    const subjectsList = await db
      .select({
        ...getTableColumns(subjects),
        department: {
          ...getTableColumns(departments),
        },
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause)
      .orderBy(desc(subjects.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    res.status(200).json({
      data: subjectsList,
      pagination: {
        page: currentPage,
        limit: limitPerPage,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitPerPage),
      },
    });
  } catch (error) {
    console.error(`GET /subjects error: ${error}`);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

export default router;
