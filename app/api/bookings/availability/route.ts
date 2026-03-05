import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/lib/db/collections";

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  if (!from || !to) return NextResponse.json({ error: "Укажите from и to" }, { status: 422 });

  const fromDate = new Date(from);
  const toDate = new Date(to);
  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return NextResponse.json({ error: "Неверный формат дат" }, { status: 422 });
  }

  const col = await collections.bookings();
  const bookings = await col
    .find(
      { startTime: { $gte: fromDate, $lt: toDate } },
      { projection: { _id: 1, computerId: 1, startTime: 1, endTime: 1 } }
    )
    .toArray();

  return NextResponse.json(bookings);
}
