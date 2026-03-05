import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getConfig } from "@/lib/config";
import BookingMy from "@/components/page/booking-my";

export default async function BookingMyPage() {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  if (!userId) redirect("/login");

  const config = await getConfig();

  return (
    <div className="px-5 py-30 flex flex-col items-center gap-8">
      <BookingMy slotDuration={config.slotDuration} timezone={config.timezone} />
    </div>
  );
}
