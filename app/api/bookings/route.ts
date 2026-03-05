import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/db/collections";
import { schemas } from "@/lib/validator";
import { getConfig } from "@/lib/config";
import { validateBooking } from "@/lib/booking";

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId || !ObjectId.isValid(userId)) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const col = await collections.bookings();
  const bookings = await col
    .find({ userId: new ObjectId(userId) })
    .sort({ startTime: -1 })
    .toArray();

  return NextResponse.json(bookings);
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId || !ObjectId.isValid(userId)) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const parsed = await schemas.booking.safeParseAsync(await req.json());
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(", ") }, { status: 422 });
  }
  const { computerId, startTime: startTimeStr, slotCount } = parsed.data;

  const [usersCol, layoutCol, bookingsCol, config] = await Promise.all([
    collections.users(),
    collections.layout(),
    collections.bookings(),
    getConfig(),
  ]);

  // Check user has fio and group
  const user = await usersCol.findOne(
    { _id: new ObjectId(userId) },
    { projection: { fio: 1, group: 1 } }
  );
  if (!user?.fio || !user?.group) {
    return NextResponse.json({ error: "Заполните ФИО и группу в профиле" }, { status: 403 });
  }

  // Compute times
  const startTime = new Date(startTimeStr);
  const endTime = new Date(startTime.getTime() + slotCount * config.slotDuration * 60_000);

  // Time bounds validation
  const now = new Date();
  if (startTime <= now) {
    return NextResponse.json({ error: "Нельзя бронировать прошедшее время" }, { status: 422 });
  }
  const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  if (startTime > weekAhead) {
    return NextResponse.json({ error: "Нельзя бронировать более чем на неделю вперёд" }, { status: 422 });
  }

  // Check computer exists in layout
  const layout = await layoutCol.findOne({});
  const computerCount = layout?.computers?.length ?? 0;
  if (computerId >= computerCount) {
    return NextResponse.json({ error: "Компьютер не найден" }, { status: 422 });
  }

  // Check for overlap on this computer
  const conflict = await bookingsCol.findOne({
    computerId,
    startTime: { $lt: endTime },
    endTime:   { $gt: startTime },
  });
  if (conflict) {
    return NextResponse.json({ error: "Это время уже занято" }, { status: 409 });
  }

  // Custom validation hook
  if (!validateBooking(user.fio, user.group, startTime)) {
    return NextResponse.json({ error: "Бронирование недоступно" }, { status: 403 });
  }

  const result = await bookingsCol.insertOne({
    userId: new ObjectId(userId),
    computerId,
    startTime,
    endTime,
  } as never);

  return NextResponse.json({ _id: result.insertedId }, { status: 201 });
}
