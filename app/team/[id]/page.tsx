import TeamDetail from '@/components/page/team-detail';
import { headers } from 'next/headers';
import { collections } from '@/lib/db/collections';
import { ObjectId } from 'mongodb';

type Props = { params: Promise<{ id: string }> };

export default async function TeamPage({ params }: Props) {
  const { id } = await params;
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
      <TeamDetail teamId={id} userId={userId} hasFio={hasFio} />
    </div>
  );
}
