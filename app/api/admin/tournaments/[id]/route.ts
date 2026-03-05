import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { collections } from '@/lib/db/collections';
import { schemas } from '@/lib/validator';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const role = req.headers.get('x-user-role');
  if (role !== 'admin') return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: 'Некорректный ID' }, { status: 422 });

  const parsed = await schemas.tournament.safeParseAsync(await req.json());
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(', ') }, { status: 422 });
  }

  const { title, description, date, minTeamSize, maxTeamSize } = parsed.data;
  const tournamentsCol = await collections.tournaments();

  const result = await tournamentsCol.updateOne(
    { _id: new ObjectId(id) },
    { $set: { title, description: description || undefined, date: new Date(date), minTeamSize, maxTeamSize } },
  );

  if (result.matchedCount === 0) return NextResponse.json({ error: 'Турнир не найден' }, { status: 404 });

  return NextResponse.json({}, { status: 200 });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const role = req.headers.get('x-user-role');
  if (role !== 'admin') return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: 'Некорректный ID' }, { status: 422 });

  const tournamentsCol = await collections.tournaments();
  const result = await tournamentsCol.deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) return NextResponse.json({ error: 'Турнир не найден' }, { status: 404 });

  return NextResponse.json({}, { status: 200 });
}
