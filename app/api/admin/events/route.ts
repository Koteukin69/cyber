import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { collections } from '@/lib/db/collections';
import { schemas } from '@/lib/validator';

export async function GET(req: NextRequest) {
  const role = req.headers.get('x-user-role');
  if (role !== 'admin') return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });

  const eventsCol = await collections.events();
  const events = await eventsCol.find({}).sort({ date: -1 }).toArray();

  return NextResponse.json({
    events: events.map(e => ({
      _id: e._id.toString(),
      title: e.title,
      description: e.description ?? null,
      date: e.date.toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const role = req.headers.get('x-user-role');
  if (role !== 'admin') return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });

  const parsed = await schemas.event.safeParseAsync(await req.json());
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(', ') }, { status: 422 });
  }

  const { title, description, date } = parsed.data;
  const eventsCol = await collections.events();

  const result = await eventsCol.insertOne({
    _id: new ObjectId(),
    title,
    description: description || undefined,
    date: new Date(date),
  });

  return NextResponse.json({ _id: result.insertedId.toString() }, { status: 201 });
}
