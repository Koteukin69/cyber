import AdminTournamentsForm from '@/components/page/admin-tournaments-form';
import { getConfig } from '@/lib/config';

export default async function AdminTournamentsPage() {
  const config = await getConfig();

  return (
    <div className="px-5 sm:px-10 md:px-20 py-30 flex flex-col gap-10">
      <AdminTournamentsForm timezoneOffset={config.timezone} />
    </div>
  );
}
