"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldError,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { formatEventDate } from "@/lib/timezones";
import { ArrowLeftIcon, Trash2Icon } from "lucide-react";

interface BookingItem {
  _id: string;
  computerId: number;
  startTime: string;
  endTime: string;
}

interface Props {
  slotDuration: number;
  timezone: number;
}

export default function BookingMy({ slotDuration, timezone }: Props) {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/bookings")
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(() => setError("Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, []);

  async function cancel(id: string) {
    setError("");
    const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    if (res.ok) {
      setBookings(prev => prev.filter(b => b._id !== id));
    } else {
      const data = await res.json();
      setError(data.error ?? "Ошибка отмены");
    }
  }

  const now = Date.now();

  return (
    <FieldSet className="w-full max-w-2xl">
      <FieldLegend className="w-full flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/booking"><ArrowLeftIcon /></Link>
        </Button>
        Мои записи
      </FieldLegend>

      <FieldSeparator />

      <FieldGroup>
        {loading && (
          <p className="text-sm text-muted-foreground text-center py-4">Загрузка…</p>
        )}
        {!loading && bookings.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Записей пока нет
          </p>
        )}
        {bookings.map(b => {
          const isPast = new Date(b.startTime).getTime() < now;
          const durationSlots = Math.round(
            (new Date(b.endTime).getTime() - new Date(b.startTime).getTime()) /
            (slotDuration * 60_000)
          );
          return (
            <div
              key={b._id}
              className={`rounded-lg border px-4 py-3 flex items-start justify-between gap-4 ${isPast ? "opacity-60" : ""}`}
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-medium text-sm">Компьютер #{b.computerId}</span>
                <span className="text-xs text-muted-foreground">
                  {formatEventDate(new Date(b.startTime), timezone)}
                </span>
                <span className="text-xs text-muted-foreground">
                  — {formatEventDate(new Date(b.endTime), timezone)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {durationSlots} {durationSlots === 1 ? "слот" : durationSlots < 5 ? "слота" : "слотов"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                type="button"
                disabled={isPast}
                onClick={() => cancel(b._id)}
                className="shrink-0 text-destructive hover:text-destructive"
              >
                <Trash2Icon />
              </Button>
            </div>
          );
        })}
        {error && <FieldError>{error}</FieldError>}
      </FieldGroup>

      <Field className="hidden" />
    </FieldSet>
  );
}
