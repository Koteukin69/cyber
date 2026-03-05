import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { collections } from '@/lib/db/collections';
import { schemas } from '@/lib/validator';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');

  const search = req.nextUrl.searchParams.get('search')?.trim() || '';
  const myOnly = req.nextUrl.searchParams.get('my') === 'true';

  const teamsCol = await collections.teams();

  const filter: Record<string, unknown> = {};

  if (search) {
    const usersCol = await collections.users();
    const matchedUsers = await usersCol
      .find({ fio: { $regex: search, $options: 'i' } }, { projection: { _id: 1 } })
      .toArray();
    const matchedUserIds = matchedUsers.map(u => u._id);

    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { 'members.userId': { $in: matchedUserIds } },
    ];
  }

  if (myOnly && userId && ObjectId.isValid(userId)) {
    filter['members.userId'] = new ObjectId(userId);
  }

  const teams = await teamsCol
    .aggregate([
      { $match: filter },
      {
        $project: {
          name: 1,
          membersCount: { $size: '$members' },
          captainId: { $first: '$members.userId' },
          isMember: userId && ObjectId.isValid(userId)
            ? { $in: [new ObjectId(userId), '$members.userId'] }
            : false,
        },
      },
      { $sort: { name: 1 } },
    ])
    .toArray();

  return NextResponse.json({
    teams: teams.map(t => ({
      _id: t._id.toString(),
      name: t.name,
      membersCount: t.membersCount,
      captainId: t.captainId?.toString() ?? null,
      isMember: t.isMember,
    })),
  });
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  if (!ObjectId.isValid(userId)) return NextResponse.json({ error: 'Некорректный ID' }, { status: 422 });

  const parsed = await schemas.team.safeParseAsync(await req.json());
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(', ') }, { status: 422 });
  }

  const { name } = parsed.data;
  const usersCol = await collections.users();
  const creator = await usersCol.findOne({ _id: new ObjectId(userId) }, { projection: { fio: 1 } });
  if (!creator?.fio) {
    return NextResponse.json({ error: 'Заполните ФИО в профиле' }, { status: 403 });
  }

  const teamsCol = await collections.teams();

  const result = await teamsCol.insertOne({
    _id: new ObjectId(),
    name,
    members: [{ userId: new ObjectId(userId), joinedAt: new Date() }],
    applications: [],
  });

  return NextResponse.json({ _id: result.insertedId.toString() }, { status: 201 });
}
