import { headers } from "next/headers";
import { collections } from "@/lib/db/collections";
import AdminBookingForm from "@/components/page/admin-booking-form";
import type { LayoutConfig } from "@/lib/types";

const DEFAULT_LAYOUT: LayoutConfig = { width: 10, height: 10, computers: [] };

export default async function AdminBookingPage() {
  const headersList = await headers();
  const role = headersList.get('x-user-role');
  if (role !== 'admin') return <p className="p-8 text-muted-foreground">Нет доступа</p>;

  const col = await collections.layout();
  const doc = await col.findOne({});
  const layout: LayoutConfig = doc
    ? { width: doc.width, height: doc.height, computers: doc.computers }
    : DEFAULT_LAYOUT;

  return (
    <div className="px-5 sm:px-10 md:px-20 py-30 flex flex-col gap-10">
      <AdminBookingForm initialLayout={layout} />
    </div>
  );
}
