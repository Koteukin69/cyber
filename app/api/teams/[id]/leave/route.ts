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

  const userObjectId = new ObjectId(userId);
  const teamsCol = await collections.teams();
  const team = await teamsCol.findOne({ _id: new ObjectId(id) });
  if (!team) return NextResponse.json({ error: 'Команда не найдена' }, { status: 404 });

  if (!team.members.some(m => m.userId.equals(userObjectId))) {
    return NextResponse.json({ error: 'Вы не состоите в этой команде' }, { status: 409 });
  }

  const remainingMembers = team.members.filter(m => !m.userId.equals(userObjectId));

  if (remainingMembers.length === 0) {
    await teamsCol.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ deleted: true }, { status: 200 });
  }

  await teamsCol.updateOne(
    { _id: new ObjectId(id) },
    { $pull: { members: { userId: userObjectId } } }
  );

  return NextResponse.json({}, { status: 200 });
}
