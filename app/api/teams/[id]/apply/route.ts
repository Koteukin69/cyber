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
  const usersCol = await collections.users();
  const applicant = await usersCol.findOne({ _id: userObjectId }, { projection: { fio: 1 } });
  if (!applicant?.fio) {
    return NextResponse.json({ error: 'Заполните ФИО в профиле' }, { status: 403 });
  }

  const teamsCol = await collections.teams();
  const team = await teamsCol.findOne({ _id: new ObjectId(id) });
  if (!team) return NextResponse.json({ error: 'Команда не найдена' }, { status: 404 });

  if (team.members.some(m => m.userId.equals(userObjectId))) {
    return NextResponse.json({ error: 'Вы уже состоите в этой команде' }, { status: 409 });
  }
  if (team.applications.some(a => a.equals(userObjectId))) {
    return NextResponse.json({ error: 'Заявка уже отправлена' }, { status: 409 });
  }

  await teamsCol.updateOne(
    { _id: new ObjectId(id) },
    { $push: { applications: userObjectId } }
  );

  return NextResponse.json({}, { status: 200 });
}
