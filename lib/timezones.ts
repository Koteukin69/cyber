export interface TimezoneOption {
  label: string;
  value: number;
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { label: "UTC−12", value: -12 },
  { label: "UTC−11", value: -11 },
  { label: "UTC−10", value: -10 },
  { label: "UTC−9", value: -9 },
  { label: "UTC−8", value: -8 },
  { label: "UTC−7", value: -7 },
  { label: "UTC−6", value: -6 },
  { label: "UTC−5", value: -5 },
  { label: "UTC−4", value: -4 },
  { label: "UTC−3", value: -3 },
  { label: "UTC−2", value: -2 },
  { label: "UTC−1", value: -1 },
  { label: "UTC+0", value: 0 },
  { label: "UTC+1", value: 1 },
  { label: "UTC+2", value: 2 },
  { label: "UTC+3", value: 3 },
  { label: "UTC+4", value: 4 },
  { label: "UTC+5", value: 5 },
  { label: "UTC+6", value: 6 },
  { label: "UTC+7", value: 7 },
  { label: "UTC+8", value: 8 },
  { label: "UTC+9", value: 9 },
  { label: "UTC+10", value: 10 },
  { label: "UTC+11", value: 11 },
  { label: "UTC+12", value: 12 },
];

export const DEFAULT_TIMEZONE = 3;

export function formatEventDate(date: Date, offset: number): string {
  const tz = offset === 0 ? 'UTC' : `Etc/GMT${offset > 0 ? '-' : '+'}${Math.abs(offset)}`;
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: tz,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
