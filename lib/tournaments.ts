import { ObjectId } from 'mongodb';
import { collections } from '@/lib/db/collections';

export async function syncTeamTournamentEligibility(
  teamId: ObjectId,
  membersCount: number,
): Promise<void> {
  const tournamentsCol = await collections.tournaments();
  await tournamentsCol.updateMany(
    {
      'registrations.teamId': teamId,
      $or: [
        { minTeamSize: { $gt: membersCount } },
        { maxTeamSize: { $lt: membersCount } },
      ],
    },
    { $pull: { registrations: { teamId } } },
  );
}

export async function removeTeamAllRegistrations(teamId: ObjectId): Promise<void> {
  const tournamentsCol = await collections.tournaments();
  await tournamentsCol.updateMany(
    { 'registrations.teamId': teamId },
    { $pull: { registrations: { teamId } } },
  );
}
