import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { collections } from '@/lib/db/collections';

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  if (!ObjectId.isValid(id) || !ObjectId.isValid(userId)) {
    return NextResponse.json({ error: 'Некорректный ID' }, { status: 422 });
  }

  const body = await req.json();
  const { applicantId } = body;
  if (!applicantId || !ObjectId.isValid(applicantId)) {
    return NextResponse.json({ error: 'Некорректный ID заявителя' }, { status: 422 });
  }

  const teamsCol = await collections.teams();
  const team = await teamsCol.findOne({ _id: new ObjectId(id) });
  if (!team) return NextResponse.json({ error: 'Команда не найдена' }, { status: 404 });

  const captainId = team.members[0]?.userId;
  if (!captainId?.equals(new ObjectId(userId))) {
    return NextResponse.json({ error: 'Только капитан может отклонять заявки' }, { status: 403 });
  }

  await teamsCol.updateOne(
    { _id: new ObjectId(id) },
    { $pull: { applications: new ObjectId(applicantId) } }
  );

  return NextResponse.json({}, { status: 200 });
}
