import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { collections } from '@/lib/db/collections';
import { schemas } from '@/lib/validator';

export async function GET(req: NextRequest) {
  const role = req.headers.get('x-user-role');
  if (role !== 'admin') return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });

  const tournamentsCol = await collections.tournaments();
  const tournaments = await tournamentsCol.find({}).sort({ date: -1 }).toArray();

  return NextResponse.json({
    tournaments: tournaments.map(t => ({
      _id: t._id.toString(),
      title: t.title,
      description: t.description ?? null,
      date: t.date.toISOString(),
      minTeamSize: t.minTeamSize,
      maxTeamSize: t.maxTeamSize,
      registrationsCount: t.registrations.length,
    })),
  });
}

export async function POST(req: NextRequest) {
  const role = req.headers.get('x-user-role');
  if (role !== 'admin') return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });

  const parsed = await schemas.tournament.safeParseAsync(await req.json());
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(', ') }, { status: 422 });
  }

  const { title, description, date, minTeamSize, maxTeamSize } = parsed.data;
  const tournamentsCol = await collections.tournaments();

  const result = await tournamentsCol.insertOne({
    _id: new ObjectId(),
    title,
    description: description || undefined,
    date: new Date(date),
    minTeamSize,
    maxTeamSize,
    registrations: [],
  });

  return NextResponse.json({ _id: result.insertedId.toString() }, { status: 201 });
}
