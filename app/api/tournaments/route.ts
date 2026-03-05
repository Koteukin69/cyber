import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { collections } from '@/lib/db/collections';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  const teamIdParam = req.nextUrl.searchParams.get('teamId');

  const now = new Date();
  const tournamentsCol = await collections.tournaments();

  if (teamIdParam) {
    if (!ObjectId.isValid(teamIdParam)) {
      return NextResponse.json({ error: 'Некорректный ID команды' }, { status: 422 });
    }

    const teamId = new ObjectId(teamIdParam);
    const teamsCol = await collections.teams();
    const team = await teamsCol.findOne({ _id: teamId });

    if (!team) return NextResponse.json({ error: 'Команда не найдена' }, { status: 404 });

    const captainId = team.members[0]?.userId;
    if (!userId || !captainId?.equals(new ObjectId(userId))) {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }

    const membersCount = team.members.length;

    const tournaments = await tournamentsCol
      .find({
        date: { $gte: now },
        minTeamSize: { $lte: membersCount },
        maxTeamSize: { $gte: membersCount },
      })
      .sort({ date: 1 })
      .toArray();

    return NextResponse.json({
      tournaments: tournaments.map(t => ({
        _id: t._id.toString(),
        title: t.title,
        description: t.description ?? null,
        date: t.date.toISOString(),
        minTeamSize: t.minTeamSize,
        maxTeamSize: t.maxTeamSize,
        registrationsCount: t.registrations.length,
        isRegistered: t.registrations.some(r => r.teamId.equals(teamId)),
      })),
    });
  }

  const tournaments = await tournamentsCol
    .find({ date: { $gte: now } })
    .sort({ date: 1 })
    .toArray();

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
