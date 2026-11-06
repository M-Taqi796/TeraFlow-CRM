import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { DEFAULT_ORG_ID } from '@/lib/services/crmService';

export async function POST(req: Request) {
  try {
    const { name, email, password, permissions, title } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const pool = getDbPool();
    const result = await pool.query(
      `SELECT provision_crm_user(
        $1, $2, $3, $4, 'Team Member', $5,
        $6, $7, $8, $9, $10, $11
      ) AS user_id`,
      [
        email.trim().toLowerCase(),
        password,
        name.trim(),
        DEFAULT_ORG_ID,
        title || '',
        Boolean(permissions?.manageLeads),
        Boolean(permissions?.manageOutreach),
        Boolean(permissions?.manageTasks),
        Boolean(permissions?.manageMeetings),
        Boolean(permissions?.importData),
        Boolean(permissions?.exportData),
      ]
    );

    const userId = result.rows[0]?.user_id;
    return NextResponse.json({ success: true, userId }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/team error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create team member' },
      { status: 500 }
    );
  }
}

