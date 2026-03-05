"use client";

import { useState, useEffect, useCallback } from "react";
import { CalendarIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { formatEventDate } from "@/lib/timezones";

interface EventItem {
  _id: string;
  title: string;
  description: string | null;
  date: string; // ISO UTC string
}

interface FormState {
  title: string;
  description: string;
  date: string; // datetime-local value (local time in configured tz)
}

const EMPTY_FORM: FormState = { title: "", description: "", date: "" };

// UTC ISO string → datetime-local string in configured timezone
function toLocalInput(isoDate: string, offset: number): string {
  const utcMs = new Date(isoDate).getTime();
  return new Date(utcMs + offset * 3_600_000).toISOString().slice(0, 16);
}

// datetime-local string (local time) → UTC ISO string
function toUTC(local: string, offset: number): string {
  const localMs = new Date(local + ":00.000Z").getTime();
  return new Date(localMs - offset * 3_600_000).toISOString();
}

export default function AdminEventsForm({ timezoneOffset }: { timezoneOffset: number }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null); // null = create mode
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/events");
    if (res.ok) {
      const data = await res.json();
      setEvents(data.events);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setDialogOpen(true);
  }

  function openEdit(event: EventItem) {
    setEditing(event._id);
    setForm({
      title: event.title,
      description: event.description ?? "",
      date: toLocalInput(event.date, timezoneOffset),
    });
    setFormError("");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { setFormError("Введите название"); return; }
    if (!form.date) { setFormError("Укажите дату"); return; }

    setSaving(true);
    setFormError("");

    const body = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      date: toUTC(form.date, timezoneOffset),
    };

    const res = editing
      ? await fetch(`/api/admin/events/${editing}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      : await fetch("/api/admin/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

    if (res.ok) {
      setDialogOpen(false);
      fetchEvents();
    } else {
      setFormError((await res.json()).error ?? "Ошибка");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    if (res.ok) fetchEvents();
    setDeleteId(null);
    setDeleting(false);
  }

  return (
    <FieldSet className="w-full">
      <FieldLegend className="flex w-full items-center justify-between">
        События
        <Button size="sm" variant="outline" onClick={openCreate}>
          <PlusIcon /> Создать
        </Button>
      </FieldLegend>

      <FieldSeparator />

      <div className="flex flex-col gap-2">
        {loading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Загрузка...</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Событий пока нет</p>
        ) : (
          events.map(event => (
            <div
              key={event._id}
              className="flex items-start gap-3 rounded-lg border px-4 py-3"
            >
              <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                <span className="font-medium truncate">{event.title}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <CalendarIcon className="size-3" />
                  {formatEventDate(new Date(event.date), timezoneOffset)}
                </span>
                {event.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {event.description}
                  </p>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon-sm" variant="ghost" onClick={() => openEdit(event)}>
                  <PencilIcon />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteId(event._id)}
                >
                  <Trash2Icon />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={open => { if (!open) setDialogOpen(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Редактировать событие" : "Новое событие"}</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>Название*</FieldLabel>
              <Input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                maxLength={100}
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel>Дата и время*</FieldLabel>
              <Input
                type="datetime-local"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              />
            </Field>
            <Field>
              <FieldLabel>Описание</FieldLabel>
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                maxLength={2000}
                rows={4}
                placeholder="Необязательно"
              />
            </Field>
            <FieldError>{formError}</FieldError>
          </FieldGroup>
          <DialogFooter>
            <Button onClick={handleSave} disabled={saving}>
              {editing ? "Сохранить" : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteId} onOpenChange={open => { if (!open) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить событие?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Это действие нельзя отменить.</p>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={deleting}
            >
              Удалить
            </Button>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Отмена
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FieldSet>
  );
}
