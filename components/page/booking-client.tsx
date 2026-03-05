"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { LayoutGrid } from "@/components/page/layout-grid";
import { computeSlots } from "@/lib/booking";
import type { LayoutConfig } from "@/lib/types";
import { BookmarkIcon } from "lucide-react";

interface AvailabilityBooking {
  _id: string;
  computerId: number;
  startTime: string;
  endTime: string;
}

interface BookingClientProps {
  userId: string | null;
  hasProfile: boolean;
  layout: LayoutConfig;
  config: {
    workStart: number;
    slotDuration: number;
    slotCount: number;
    timezone: number;
  };
}

function getTimezone(offset: number): string {
  return offset === 0 ? "UTC" : `Etc/GMT${offset > 0 ? "-" : "+"}${Math.abs(offset)}`;
}

function formatTime(date: Date, tz: string): string {
  return new Intl.DateTimeFormat("ru-RU", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(date);
}

function getTodayStr(tz: string): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: tz }).format(new Date());
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const RU_WEEKDAY = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

function getWeekdayLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return RU_WEEKDAY[new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay()];
}

function getISODayOfWeek(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
  return dow === 0 ? 7 : dow;
}

function isoWeekMonday(dateStr: string): string {
  return addDays(dateStr, -(getISODayOfWeek(dateStr) - 1));
}

function getInitialDate(
  tz: string,
  workStart: number,
  slotDuration: number,
  slotCount: number,
  timezone: number,
): string {
  const today = getTodayStr(tz);
  const now = Date.now();
  for (let i = 0; i < 7; i++) {
    const d = addDays(today, i);
    if (computeSlots(workStart, slotDuration, slotCount, timezone, d).some(s => s.getTime() > now)) return d;
  }
  return today;
}

type Color = "red" | "orange" | "yellow" | "green";

function getComputerColor(
  computerId: number,
  selectedSlotDate: Date,
  bookings: AvailabilityBooking[],
  slotDuration: number,
): Color {
  const selMs = selectedSlotDate.getTime();
  const cb = bookings
    .filter(b => b.computerId === computerId)
    .map(b => ({ start: new Date(b.startTime).getTime(), end: new Date(b.endTime).getTime() }));

  if (cb.some(b => b.start <= selMs && b.end > selMs)) return "red";

  const nextStart = cb.filter(b => b.start > selMs).reduce((m, b) => Math.min(m, b.start), Infinity);
  const freeMs = nextStart - selMs;
  if (freeMs < slotDuration * 60_000) return "orange";
  if (freeMs < 3 * slotDuration * 60_000) return "yellow";
  return "green";
}

const OUTLINE_CLASS: Record<Color, string> = {
  red:    "border border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950",
  orange: "border border-orange-400 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950",
  yellow: "border border-yellow-400 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950",
  green:  "border border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950",
};

const FILLED_CLASS: Record<Color, string> = {
  red:    "bg-red-500 text-white",
  orange: "bg-orange-400 text-white",
  yellow: "bg-yellow-400 text-white",
  green:  "bg-green-500 text-white",
};

function getMaxFreeSlots(
  computerId: number,
  slotIndex: number,
  slots: Date[],
  bookings: AvailabilityBooking[],
  slotDuration: number,
): number {
  let count = 0;
  for (let i = slotIndex; i < slots.length; i++) {
    const ms = slots[i].getTime();
    const end = ms + slotDuration * 60_000;
    const blocked = bookings
      .filter(b => b.computerId === computerId)
      .some(b => new Date(b.startTime).getTime() < end && new Date(b.endTime).getTime() > ms);
    if (blocked) break;
    count++;
  }
  return count;
}

interface ScheduleRange { label: string; status: "booked" | "free" }

function getComputerSchedule(
  computerId: number,
  slots: Date[],
  bookings: AvailabilityBooking[],
  slotDuration: number,
  tz: string,
): ScheduleRange[] {
  const cb = bookings
    .filter(b => b.computerId === computerId)
    .map(b => ({ start: new Date(b.startTime).getTime(), end: new Date(b.endTime).getTime() }));

  const statuses = slots.map(slot => {
    const ms = slot.getTime();
    const end = ms + slotDuration * 60_000;
    return { start: slot, end: new Date(end), booked: cb.some(b => b.start < end && b.end > ms) };
  });

  const merged: { start: Date; end: Date; booked: boolean }[] = [];
  for (const s of statuses) {
    const last = merged[merged.length - 1];
    if (last && last.booked === s.booked) { last.end = s.end; }
    else merged.push({ ...s });
  }

  return merged.map(r => ({
    label: `${formatTime(r.start, tz)} – ${formatTime(r.end, tz)}`,
    status: r.booked ? "booked" : "free",
  }));
}

export default function BookingClient({ hasProfile, layout, config }: BookingClientProps) {
  const { workStart, slotDuration, slotCount, timezone } = config;
  const tz = getTimezone(timezone);
  const today = getTodayStr(tz);

  const [dateStr, setDateStr] = useState(() =>
    getInitialDate(tz, workStart, slotDuration, slotCount, timezone),
  );
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedComputer, setSelectedComputer] = useState<number | null>(null);
  const [bookSlotCount, setBookSlotCount] = useState(1);
  const [bookings, setBookings] = useState<AvailabilityBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const allSlots = computeSlots(workStart, slotDuration, slotCount, timezone, dateStr);
  const slots = allSlots.filter(s => s.getTime() > Date.now());

  const days7 = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  const todayWeekMonday = isoWeekMonday(today);
  const thisWeekDays = days7.filter(d => isoWeekMonday(d) === todayWeekMonday);
  const nextWeekDays  = days7.filter(d => isoWeekMonday(d) !== todayWeekMonday);

  const fetchAvailability = useCallback(async () => {
    const daySlots = computeSlots(workStart, slotDuration, slotCount, timezone, dateStr);
    if (daySlots.length === 0) return;
    setLoading(true);
    const from = daySlots[0].toISOString();
    const to = new Date(daySlots[daySlots.length - 1].getTime() + slotDuration * 60_000).toISOString();
    try {
      const res = await fetch(`/api/bookings/availability?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
      if (res.ok) setBookings(await res.json());
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  useEffect(() => {
    fetchAvailability();
    setSelectedComputer(null);
    setError("");
    setSuccess("");
    const daySlots = computeSlots(workStart, slotDuration, slotCount, timezone, dateStr);
    const n = Date.now();
    const hasFuture = daySlots.some(s => s.getTime() > n);
    setSelectedSlot(hasFuture ? 0 : null);
  }, [fetchAvailability]);

  useEffect(() => {
    setBookSlotCount(1);
    setError("");
    setSuccess("");
  }, [selectedSlot, selectedComputer]);

  const safeSlot = selectedSlot !== null && selectedSlot < slots.length ? selectedSlot : null;

  const maxFreeSlots =
    safeSlot !== null && selectedComputer !== null
      ? getMaxFreeSlots(selectedComputer, safeSlot, slots, bookings, slotDuration)
      : 0;

  const selectedColor: Color | null =
    safeSlot !== null && selectedComputer !== null
      ? getComputerColor(selectedComputer, slots[safeSlot], bookings, slotDuration)
      : null;

  const schedule: ScheduleRange[] =
    selectedComputer !== null
      ? getComputerSchedule(selectedComputer, allSlots, bookings, slotDuration, tz)
      : [];

  async function submitBooking() {
    if (safeSlot === null || selectedComputer === null) return;
    setError("");
    setSuccess("");
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        computerId: selectedComputer,
        startTime: slots[safeSlot].toISOString(),
        slotCount: bookSlotCount,
      }),
    });
    if (res.status === 201) {
      setSuccess("Бронирование создано!");
      setSelectedComputer(null);
      await fetchAvailability();
    } else {
      const data = await res.json();
      setError(data.error ?? "Ошибка");
    }
  }

  return (
    <FieldSet className="w-full max-w-2xl">
      <FieldLegend className="w-full flex justify-between items-center">
        Бронирование
        <Button variant="ghost" size="sm" asChild>
          <Link href="/booking/my">
            <BookmarkIcon className="size-4" />
            Мои записи
          </Link>
        </Button>
      </FieldLegend>

      <FieldSeparator />

      <FieldGroup>
        <Field>
          <FieldLabel>Дата</FieldLabel>
          <div className="flex flex-wrap gap-2 items-center">
            {nextWeekDays.map(d => (
              <Button
                key={d}
                variant={dateStr === d ? "default" : "outline"}
                size="sm"
                type="button"
                className="w-16 h-8 flex-col -gap-8"
                onClick={() => setDateStr(d)}
              >
                <span>{getWeekdayLabel(d)}</span>
                <span className="text-[10px] opacity-60">{Number(d.slice(8))}</span>
              </Button>
            ))}

            {thisWeekDays.map(d => (
              <Button
                key={d}
                variant={dateStr === d ? "default" : "outline"}
                size="sm"
                type="button"
                className="w-16 h-8 flex-col -gap-8"
                onClick={() => setDateStr(d)}
              >
                <span>{d === today ? "Сег" : getWeekdayLabel(d)}</span>
                <span className="text-[10px] opacity-60">{Number(d.slice(8))}</span>
              </Button>
            ))}
          </div>
        </Field>

        {slots.length > 0 && (
          <Field>
            <FieldLabel>Время начала</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {slots.map((slot, i) => (
                <Button
                  key={i}
                  variant={selectedSlot === i ? "default" : "outline"}
                  size="sm"
                  type="button"
                  onClick={() => {
                    setSelectedSlot(i);
                    setSelectedComputer(null);
                  }}
                >
                  {formatTime(slot, tz)}
                </Button>
              ))}
            </div>
          </Field>
        )}

        {slots.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Нет доступных слотов на эту дату
          </p>
        )}
      </FieldGroup>

      {safeSlot !== null && (
        <>
          <FieldSeparator />
          <FieldGroup>
            {layout.computers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Layout не настроен</p>
            ) : (
              <div className="w-full max-w-sm mx-auto">
                <LayoutGrid
                  width={layout.width}
                  height={layout.height}
                  computers={layout.computers}
                  renderButton={(id) => {
                    const color = getComputerColor(id, slots[safeSlot], bookings, slotDuration);
                    const isSelected = selectedComputer === id;
                    return (
                      <button
                        type="button"
                        className={`w-full h-full rounded text-sm font-medium transition-colors
                          ${isSelected ? FILLED_CLASS[color] : OUTLINE_CLASS[color]}`}
                        onClick={() => setSelectedComputer(isSelected ? null : id)}
                      >
                        #{id}
                      </button>
                    );
                  }}
                />
              </div>
            )}
            {loading && <p className="text-xs text-muted-foreground text-center">Загрузка…</p>}
          </FieldGroup>
        </>
      )}

      {safeSlot !== null && selectedComputer !== null && (
        <>
          <FieldSeparator />
          <FieldGroup>
            <FieldLegend variant="label">Компьютер #{selectedComputer}</FieldLegend>

            <div className="flex flex-col gap-1">
              {schedule.map((r, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="text-muted-foreground tabular-nums">{r.label}</span>
                  <span className={r.status === "booked" ? "text-destructive" : "text-green-600 dark:text-green-400"}>
                    {r.status === "booked" ? "Занято" : "Свободно"}
                  </span>
                </div>
              ))}
            </div>

            {selectedColor !== "red" && (
              <>
                <Field>
                  <FieldLabel>Количество слотов</FieldLabel>
                  <Input
                    type="number"
                    min={1}
                    max={maxFreeSlots}
                    value={bookSlotCount}
                    onChange={e => setBookSlotCount(Math.min(maxFreeSlots, Math.max(1, Number(e.target.value))))}
                    className="w-24"
                  />
                  {maxFreeSlots > 0 && (
                    <p className="text-xs text-muted-foreground">
                      До {formatTime(new Date(slots[safeSlot].getTime() + bookSlotCount * slotDuration * 60_000), tz)}
                      &nbsp;· макс. {maxFreeSlots}
                    </p>
                  )}
                </Field>
                <Field orientation="horizontal">
                  <Button type="button" onClick={submitBooking} disabled={!hasProfile || maxFreeSlots === 0}>
                    Забронировать
                  </Button>
                </Field>
                {!hasProfile && (
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    <Link href="/profile" className="underline">Заполните профиль</Link>{" "}
                    (ФИО и группа) для бронирования
                  </p>
                )}
                {error && <FieldError>{error}</FieldError>}
                {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}
              </>
            )}
          </FieldGroup>
        </>
      )}
    </FieldSet>
  );
}
