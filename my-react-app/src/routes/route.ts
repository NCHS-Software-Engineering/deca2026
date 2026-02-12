import { NextRequest, NextResponse } from 'next/server';
import pool from '../Server/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ branch: string }> }) {
  try {
    // Select from inventory table with joins
    const [rows] = await pool.execute(
      `SELECT google_id, name, email, role
FROM deca.Users;`,

    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}