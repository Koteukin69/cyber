import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/db/collections";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = req.headers.get('x-user-id');
  if (!userId || !ObjectId.isValid(userId)) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Некорректный ID" }, { status: 422 });
  }

  const col = await collections.bookings();
  const booking = await col.findOne({ _id: new ObjectId(id) });
  if (!booking) return NextResponse.json({ error: "Запись не найдена" }, { status: 404 });

  if (booking.userId.toString() !== userId) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  await col.deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({}, { status: 200 });
}
