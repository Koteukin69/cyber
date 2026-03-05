import Link from 'next/link';
import { collections } from '@/lib/db/collections';
import { getConfig } from '@/lib/config';
import { formatEventDate } from '@/lib/timezones';
import { CalendarIcon, ArchiveIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function EventsPage() {
  const now = new Date();
  const [eventsCol, config] = await Promise.all([
    collections.events(),
    getConfig(),
  ]);

  const events = await eventsCol
    .find({ date: { $gte: now } })
    .sort({ date: 1 })
    .toArray();

  return (
    <div className="px-5 py-30 flex flex-col items-center gap-8">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">События</h1>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/events/archive">
              <ArchiveIcon className="size-4" />
              Архив
            </Link>
          </Button>
        </div>

        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Ближайших событий пока нет
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {events.map(event => (
              <div
                key={event._id.toString()}
                className="rounded-lg border px-5 py-4 flex flex-col gap-1.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="font-medium">{event.title}</span>
                  <span className="text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1.5 shrink-0">
                    <CalendarIcon className="size-3.5" />
                    {formatEventDate(event.date, config.timezone)}
                  </span>
                </div>
                {event.description && (
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
