import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { collections } from '@/lib/db/collections';

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: 'Некорректный ID' }, { status: 422 });

  const body = await req.json();
  const { teamId: teamIdStr } = body;
  if (!teamIdStr || !ObjectId.isValid(teamIdStr)) {
    return NextResponse.json({ error: 'Некорректный ID команды' }, { status: 422 });
  }

  const teamId = new ObjectId(teamIdStr);
  const userObjectId = new ObjectId(userId);

  const [tournamentsCol, teamsCol] = await Promise.all([
    collections.tournaments(),
    collections.teams(),
  ]);

  const [tournament, team] = await Promise.all([
    tournamentsCol.findOne({ _id: new ObjectId(id) }),
    teamsCol.findOne({ _id: teamId }),
  ]);

  if (!tournament) return NextResponse.json({ error: 'Турнир не найден' }, { status: 404 });
  if (!team) return NextResponse.json({ error: 'Команда не найдена' }, { status: 404 });

  const captainId = team.members[0]?.userId;
  if (!captainId?.equals(userObjectId)) {
    return NextResponse.json({ error: 'Только капитан может регистрировать команду' }, { status: 403 });
  }

  const membersCount = team.members.length;
  if (membersCount < tournament.minTeamSize || membersCount > tournament.maxTeamSize) {
    return NextResponse.json(
      { error: `Состав команды не соответствует требованиям турнира (${tournament.minTeamSize}–${tournament.maxTeamSize} участников)` },
      { status: 409 },
    );
  }

  if (tournament.registrations.some(r => r.teamId.equals(teamId))) {
    return NextResponse.json({ error: 'Команда уже зарегистрирована' }, { status: 409 });
  }

  const memberIds = team.members.map(m => m.userId);
  const registeredTeamIds = tournament.registrations.map(r => r.teamId);

  if (registeredTeamIds.length > 0) {
    const conflictingTeam = await teamsCol.findOne({
      _id: { $in: registeredTeamIds },
      'members.userId': { $in: memberIds },
    });

    if (conflictingTeam) {
      return NextResponse.json(
        { error: 'Один из участников команды уже зарегистрирован в этом турнире' },
        { status: 409 },
      );
    }
  }

  await tournamentsCol.updateOne(
    { _id: new ObjectId(id) },
    { $push: { registrations: { teamId, registeredAt: new Date() } } },
  );

  return NextResponse.json({}, { status: 200 });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: 'Некорректный ID' }, { status: 422 });

  const body = await req.json();
  const { teamId: teamIdStr } = body;
  if (!teamIdStr || !ObjectId.isValid(teamIdStr)) {
    return NextResponse.json({ error: 'Некорректный ID команды' }, { status: 422 });
  }

  const teamId = new ObjectId(teamIdStr);
  const userObjectId = new ObjectId(userId);

  const [tournamentsCol, teamsCol] = await Promise.all([
    collections.tournaments(),
    collections.teams(),
  ]);

  const team = await teamsCol.findOne({ _id: teamId });
  if (!team) return NextResponse.json({ error: 'Команда не найдена' }, { status: 404 });

  const captainId = team.members[0]?.userId;
  if (!captainId?.equals(userObjectId)) {
    return NextResponse.json({ error: 'Только капитан может отменить регистрацию' }, { status: 403 });
  }

  const result = await tournamentsCol.updateOne(
    { _id: new ObjectId(id), 'registrations.teamId': teamId },
    { $pull: { registrations: { teamId } } },
  );

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: 'Регистрация не найдена' }, { status: 404 });
  }

  return NextResponse.json({}, { status: 200 });
}
