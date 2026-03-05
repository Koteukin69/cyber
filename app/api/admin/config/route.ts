import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/lib/db/collections";
import { schemas } from "@/lib/validator";
import { DEFAULT_CONFIG_STRINGS } from "@/lib/config";
import { DEFAULT_TIMEZONE } from "@/lib/timezones";

export async function GET(req: NextRequest) {
  const role = req.headers.get('x-user-role');
  if (role !== 'admin') return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const col = await collections.siteConfig();
  const doc = await col.findOne({});

  return NextResponse.json({
    name: doc?.name ?? DEFAULT_CONFIG_STRINGS.name,
    briefDescription: doc?.briefDescription ?? DEFAULT_CONFIG_STRINGS.briefDescription,
    description: doc?.description ?? DEFAULT_CONFIG_STRINGS.description,
    emailSubject: doc?.emailSubject ?? DEFAULT_CONFIG_STRINGS.emailSubject,
    emailHtml: doc?.emailHtml ?? DEFAULT_CONFIG_STRINGS.emailHtml,
    timezone: doc?.timezone ?? DEFAULT_TIMEZONE,
  });
}

export async function POST(req: NextRequest) {
  const role = req.headers.get('x-user-role');
  if (role !== 'admin') return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const parsed = await schemas.siteConfig.safeParseAsync(await req.json());
  if (parsed.error) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(", ") }, { status: 422 });

  const col = await collections.siteConfig();
  await col.updateOne({}, { $set: parsed.data }, { upsert: true });

  return NextResponse.json({}, { status: 200 });
}
