import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/lib/db/collections";
import { schemas } from "@/lib/validator";

const DEFAULT_LAYOUT = { width: 10, height: 10, computers: [] };

export async function GET(req: NextRequest) {
  const role = req.headers.get('x-user-role');
  if (role !== 'admin') return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const col = await collections.layout();
  const doc = await col.findOne({});
  return NextResponse.json(doc ?? DEFAULT_LAYOUT);
}

export async function PUT(req: NextRequest) {
  const role = req.headers.get('x-user-role');
  if (role !== 'admin') return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const parsed = await schemas.layout.safeParseAsync(await req.json());
  if (parsed.error) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(", ") }, { status: 422 });

  const col = await collections.layout();
  await col.updateOne({}, { $set: parsed.data }, { upsert: true });

  return NextResponse.json({}, { status: 200 });
}
