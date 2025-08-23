import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // ✅ CORRECTED: Import the 'db' object, not 'query'.

// A consistent data transformation function is critical.
// It maps database snake_case to frontend camelCase.
const transformRule = (rule) => ({
  id: rule.id,
  groupId: rule.group_id,
  groupName: rule.group_name,
  name: rule.name,
  description: rule.description,
  detectionLogic: rule.detection_logic,
  source: rule.source,
  severity: rule.severity,
  isActive: rule.is_active,
  version: rule.version,
  lastModifiedBy: rule.last_modified_by,
  updatedAt: rule.updated_at,
  createdAt: rule.created_at,
});

// GET /api/rules - Fetches all rules with their group names
export async function GET(request) {
  try {
    const rulesQuery = `
      SELECT
        r.id, r.name, r.description, r.detection_logic, r.source, r.severity,
        r.is_active, r.version, r.last_modified_by, r.updated_at, r.created_at,
        r.group_id, rg.name as group_name
      FROM rules r
      JOIN rule_groups rg ON r.group_id = rg.id
      ORDER BY r.name ASC;
    `;

    // ✅ CORRECTED: Call the query method on the db object.
    const { rows } = await db.query(rulesQuery);
    const rules = rows.map(transformRule);
    return NextResponse.json(rules);

  } catch (error) {
    console.error("API GET /api/rules Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/rules - Creates a new rule
export async function POST(request) {
  try {
    const {
      name,
      description,
      groupId,
      detectionLogic,
      severity,
      source,
      lastModifiedBy
    } = await request.json();

    if (!name || !groupId || !detectionLogic || !severity) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const insertQuery = `
      INSERT INTO rules
        (name, description, group_id, detection_logic, severity, source, last_modified_by, is_active, version)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, true, 1)
      RETURNING id;
    `;

    // ✅ CORRECTED: Call the query method on the db object.
    const { rows: newRuleRows } = await db.query(insertQuery, [
      name, description, groupId, detectionLogic, severity, source, lastModifiedBy
    ]);

    const newRuleId = newRuleRows[0].id;

    const selectQuery = `
          SELECT
            r.id, r.name, r.description, r.detection_logic, r.source, r.severity,
            r.is_active, r.version, r.last_modified_by, r.updated_at, r.created_at,
            r.group_id, rg.name as group_name
          FROM rules r
          JOIN rule_groups rg ON r.group_id = rg.id
          WHERE r.id = $1;
        `;

    // ✅ CORRECTED: Call the query method on the db object.
    const { rows } = await db.query(selectQuery, [newRuleId]);
    const newRule = transformRule(rows[0]);

    return NextResponse.json(newRule, { status: 201 });

  } catch (error) {
    console.error("API POST /api/rules Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
