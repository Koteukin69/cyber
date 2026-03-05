import AdminEventsForm from '@/components/page/admin-events-form';
import { getConfig } from '@/lib/config';

export default async function AdminEventsPage() {
  const config = await getConfig();

  return (
    <div className="px-5 sm:px-10 md:px-20 py-30 flex flex-col gap-10">
      <AdminEventsForm timezoneOffset={config.timezone} />
    </div>
  );
}
