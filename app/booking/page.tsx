import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/db/collections";
import { getConfig } from "@/lib/config";
import BookingClient from "@/components/page/booking-client";
import type { LayoutConfig } from "@/lib/types";

const DEFAULT_LAYOUT: LayoutConfig = { width: 10, height: 10, computers: [] };

export default async function BookingPage() {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');

  const [usersCol, layoutCol, config] = await Promise.all([
    collections.users(),
    collections.layout(),
    getConfig(),
  ]);

  const user =
    userId && ObjectId.isValid(userId)
      ? await usersCol.findOne(
          { _id: new ObjectId(userId) },
          { projection: { fio: 1, group: 1 } }
        )
      : null;

  const hasProfile = !!(user?.fio && user?.group);

  if (!hasProfile) redirect('/login');

  const doc = await layoutCol.findOne({});
  const layout: LayoutConfig = doc
    ? { width: doc.width, height: doc.height, computers: doc.computers }
    : DEFAULT_LAYOUT;

  return (
    <div className="px-5 py-30 flex flex-col items-center gap-8">
      <BookingClient
        userId={userId}
        hasProfile={hasProfile}
        layout={layout}
        config={{
          workStart: config.workStart,
          slotDuration: config.slotDuration,
          slotCount: config.slotCount,
          timezone: config.timezone,
        }}
      />
    </div>
  );
}
