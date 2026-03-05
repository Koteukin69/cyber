import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { collections } from '@/lib/db/collections';
import { schemas } from '@/lib/validator';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const userId = req.headers.get('x-user-id');

  if (!ObjectId.isValid(id)) return NextResponse.json({ error: 'Некорректный ID' }, { status: 422 });

  const teamsCol = await collections.teams();
  const team = await teamsCol.findOne({ _id: new ObjectId(id) });
  if (!team) return NextResponse.json({ error: 'Команда не найдена' }, { status: 404 });

  const userObjectId = userId && ObjectId.isValid(userId) ? new ObjectId(userId) : null;
  const captainId = team.members[0]?.userId ?? null;
  const isCaptain = !!userObjectId && captainId?.equals(userObjectId);
  const isMember = !!userObjectId && team.members.some(m => m.userId.equals(userObjectId));
  const hasApplied = !!userObjectId && team.applications.some(appId => appId.equals(userObjectId));

  const usersCol = await collections.users();
  const idsToResolve = [
    ...team.members.map(m => m.userId),
    ...(isCaptain ? team.applications : []),
  ];
  const resolvedUsers = idsToResolve.length
    ? await usersCol.find({ _id: { $in: idsToResolve } }, { projection: { _id: 1, fio: 1 } }).toArray()
    : [];
  const nameMap = new Map(resolvedUsers.map(u => [u._id.toString(), u.fio]));

  const response: Record<string, unknown> = {
    _id: team._id.toString(),
    name: team.name,
    isCaptain,
    isMember,
    hasApplied,
    members: team.members.map(m => ({
      userId: m.userId.toString(),
      joinedAt: m.joinedAt,
      fio: nameMap.get(m.userId.toString()) ?? null,
    })),
  };

  if (isCaptain) {
    response.applications = team.applications.map(appId => ({
      userId: appId.toString(),
      fio: nameMap.get(appId.toString()) ?? null,
    }));
  }

  return NextResponse.json(response);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  if (!ObjectId.isValid(id) || !ObjectId.isValid(userId)) {
    return NextResponse.json({ error: 'Некорректный ID' }, { status: 422 });
  }

  const parsed = await schemas.team.safeParseAsync(await req.json());
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(', ') }, { status: 422 });
  }

  const teamsCol = await collections.teams();
  const team = await teamsCol.findOne({ _id: new ObjectId(id) });
  if (!team) return NextResponse.json({ error: 'Команда не найдена' }, { status: 404 });

  const captainId = team.members[0]?.userId;
  if (!captainId?.equals(new ObjectId(userId))) {
    return NextResponse.json({ error: 'Только капитан может переименовать команду' }, { status: 403 });
  }

  await teamsCol.updateOne({ _id: new ObjectId(id) }, { $set: { name: parsed.data.name } });
  return NextResponse.json({}, { status: 200 });
}
