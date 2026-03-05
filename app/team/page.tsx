import TeamList from '@/components/page/team-list';
import { headers } from 'next/headers';
import { collections } from '@/lib/db/collections';
import { ObjectId } from 'mongodb';

export default async function TeamsPage() {
  const headersList = await headers();
  const userId = headersList.get('x-user-id') ?? '';

  let hasFio = false;
  if (userId && ObjectId.isValid(userId)) {
    const usersCol = await collections.users();
    const user = await usersCol.findOne({ _id: new ObjectId(userId) }, { projection: { fio: 1 } });
    hasFio = !!user?.fio;
  }

  return (
    <div className="px-5 py-30 flex flex-col items-center gap-8">
      <TeamList userId={userId} hasFio={hasFio} />
    </div>
  );
}
