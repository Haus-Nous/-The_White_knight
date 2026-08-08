// One-time setup: creates Raunaq's admin account.
// POST /api/admin/setup with { adminPassword: "your-chosen-password", setupSecret: process.env.SETUP_SECRET }
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser, userExists } from "../../../../lib/kv";

export const runtime = "nodejs";

const ADMIN_EMAIL = "raunaq1509@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const { adminEmail = "admin@example.com", adminPassword, setupSecret } = await req.json() as { adminEmail?: string; adminPassword: string; setupSecret: string };

    const expectedSecret = process.env.SETUP_SECRET;
    if (!expectedSecret || setupSecret !== expectedSecret) {
      return NextResponse.json({ error: "Invalid setup secret" }, { status: 403 });
    }

    if (await userExists(adminEmail)) {
      return NextResponse.json({ error: "Admin account already exists" }, { status: 409 });
    }

    if (!adminPassword || adminPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await createUser(adminEmail, passwordHash, true);
    return NextResponse.json({ ok: true, email: adminEmail });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Setup failed" }, { status: 500 });
  }
}
