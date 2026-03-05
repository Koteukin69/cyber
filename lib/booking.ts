// Custom validation hook — implement with your own business logic
// Called before every booking creation on the server
export function validateBooking(fio: string, group: string, startTime: Date): boolean {
  // TODO: implement custom validation (e.g. check academic calendar, quotas, etc.)
  void fio; void group; void startTime;
  return true;
}

// Returns UTC Date objects for every slot on a calendar day in the club's timezone.
// dateStr: "YYYY-MM-DD" in the club's configured timezone
export function computeSlots(
  workStart: number,
  slotDuration: number,
  slotCount: number,
  timezone: number,
  dateStr: string
): Date[] {
  const [year, month, day] = dateStr.split('-').map(Number);
  // UTC milliseconds of workStart:00:00 on this day in the club timezone
  const originMs = Date.UTC(year, month - 1, day, workStart - timezone, 0, 0);
  return Array.from({ length: slotCount }, (_, i) =>
    new Date(originMs + i * slotDuration * 60_000)
  );
}
