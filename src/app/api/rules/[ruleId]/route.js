// src/app/api/rules/[ruleId]/route.js

import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; // CORRECTED: Using the exported query function

// This helper should eventually be moved to a shared utility file.
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


// GET /api/rules/{ruleId} - Fetches a single rule
export async function GET(request, { params }) {
    const { ruleId } = params;
    try {
        const selectQuery = `
          SELECT
            r.id, r.name, r.description, r.detection_logic, r.source, r.severity,
            r.is_active, r.version, r.last_modified_by, r.updated_at, r.created_at,
            r.group_id, rg.name as group_name
          FROM rules r
          JOIN rule_groups rg ON r.group_id = rg.id
          WHERE r.id = $1;
        `;
        const { rows, rowCount } = await query(selectQuery, [ruleId]); // CORRECTED

        if (rowCount === 0) {
            return NextResponse.json({ message: 'Rule not found' }, { status: 404 });
        }

        const rule = transformRule(rows[0]);
        return NextResponse.json(rule);

    } catch (error) {
        console.error(`API GET /api/rules/${ruleId} Error:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT /api/rules/{ruleId} - Updates a specific rule
export async function PUT(request, { params }) {
    const { ruleId } = params;

    try {
        const {
            name,
            description,
            groupId,
            detectionLogic,
            severity,
            source,
            isActive,
            lastModifiedBy
        } = await request.json();

        if (name === undefined || groupId === undefined || detectionLogic === undefined || severity === undefined || isActive === undefined) {
            return NextResponse.json({ message: "Invalid or missing fields for update" }, { status: 400 });
        }

        const updateQuery = `
            UPDATE rules
            SET
                name = $1,
                description = $2,
                group_id = $3,
                detection_logic = $4,
                severity = $5,
                source = $6,
                is_active = $7,
                last_modified_by = $8,
                updated_at = NOW(),
                version = version + 1
            WHERE id = $9
            RETURNING id;
        `;

        const { rowCount } = await query(updateQuery, [ // CORRECTED
            name, description, groupId, detectionLogic, severity, source, isActive, lastModifiedBy, ruleId
        ]);

        if (rowCount === 0) {
            return NextResponse.json({ message: 'Rule not found' }, { status: 404 });
        }

        const selectQuery = `
          SELECT
            r.id, r.name, r.description, r.detection_logic, r.source, r.severity,
            r.is_active, r.version, r.last_modified_by, r.updated_at, r.created_at,
            r.group_id, rg.name as group_name
          FROM rules r
          JOIN rule_groups rg ON r.group_id = rg.id
          WHERE r.id = $1;
        `;
        const { rows } = await query(selectQuery, [ruleId]); // CORRECTED
        const updatedRule = transformRule(rows[0]);

        return NextResponse.json(updatedRule);

    } catch (error) {
        console.error(`API PUT /api/rules/${ruleId} Error:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}


// DELETE /api/rules/{ruleId} - Deletes a specific rule
export async function DELETE(request, { params }) {
    const { ruleId } = params;

    try {
        const result = await query('DELETE FROM rules WHERE id = $1', [ruleId]); // CORRECTED

        if (result.rowCount === 0) {
            return NextResponse.json({ message: 'Rule not found' }, { status: 404 });
        }

        return new NextResponse(null, { status: 204 });

    } catch (error) {
        console.error(`API DELETE /api/rules/${ruleId} Error:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}