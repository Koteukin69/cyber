import { headers } from "next/headers";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/db/collections";
import { getConfig } from "@/lib/config";
import TournamentsClient from "@/components/page/tournaments-client";

export default async function TournamentsPage() {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');

  const config = await getConfig();

  const captainTeams: { _id: string; name: string; membersCount: number }[] = [];

  if (userId && ObjectId.isValid(userId)) {
    const userObjectId = new ObjectId(userId);
    const teamsCol = await collections.teams();
    const teams = await teamsCol
      .find({ 'members.0.userId': userObjectId })
      .project({ name: 1, members: 1 })
      .toArray();

    for (const team of teams) {
      captainTeams.push({
        _id: team._id.toString(),
        name: team.name,
        membersCount: team.members.length,
      });
    }
  }

  return (
    <div className="px-5 py-30 flex flex-col items-center gap-8">
      <TournamentsClient captainTeams={captainTeams} timezoneOffset={config.timezone} />
    </div>
  );
}
