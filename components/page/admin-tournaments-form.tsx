"use client";

import { useState, useEffect, useCallback } from "react";
import { CalendarIcon, PencilIcon, PlusIcon, Trash2Icon, UsersIcon } from "lucide-react";
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

interface TournamentItem {
  _id: string;
  title: string;
  description: string | null;
  date: string;
  minTeamSize: number;
  maxTeamSize: number;
  registrationsCount: number;
}

interface FormState {
  title: string;
  description: string;
  date: string;
  minTeamSize: string;
  maxTeamSize: string;
}

const EMPTY_FORM: FormState = { title: "", description: "", date: "", minTeamSize: "1", maxTeamSize: "5" };

function toLocalInput(isoDate: string, offset: number): string {
  const utcMs = new Date(isoDate).getTime();
  return new Date(utcMs + offset * 3_600_000).toISOString().slice(0, 16);
}

function toUTC(local: string, offset: number): string {
  const localMs = new Date(local + ":00.000Z").getTime();
  return new Date(localMs - offset * 3_600_000).toISOString();
}

export default function AdminTournamentsForm({ timezoneOffset }: { timezoneOffset: number }) {
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/tournaments");
    if (res.ok) {
      const data = await res.json();
      setTournaments(data.tournaments);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTournaments(); }, [fetchTournaments]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setDialogOpen(true);
  }

  function openEdit(t: TournamentItem) {
    setEditing(t._id);
    setForm({
      title: t.title,
      description: t.description ?? "",
      date: toLocalInput(t.date, timezoneOffset),
      minTeamSize: String(t.minTeamSize),
      maxTeamSize: String(t.maxTeamSize),
    });
    setFormError("");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { setFormError("Введите название"); return; }
    if (!form.date) { setFormError("Укажите дату"); return; }
    const minTeamSize = parseInt(form.minTeamSize, 10);
    const maxTeamSize = parseInt(form.maxTeamSize, 10);
    if (isNaN(minTeamSize) || minTeamSize < 1) { setFormError("Минимум 1 участник"); return; }
    if (isNaN(maxTeamSize) || maxTeamSize < 1) { setFormError("Максимум хотя бы 1 участник"); return; }
    if (maxTeamSize < minTeamSize) { setFormError("Максимальный размер не может быть меньше минимального"); return; }

    setSaving(true);
    setFormError("");

    const body = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      date: toUTC(form.date, timezoneOffset),
      minTeamSize,
      maxTeamSize,
    };

    const res = editing
      ? await fetch(`/api/admin/tournaments/${editing}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      : await fetch("/api/admin/tournaments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

    if (res.ok) {
      setDialogOpen(false);
      fetchTournaments();
    } else {
      setFormError((await res.json()).error ?? "Ошибка");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    const res = await fetch(`/api/admin/tournaments/${id}`, { method: "DELETE" });
    if (res.ok) fetchTournaments();
    setDeleteId(null);
    setDeleting(false);
  }

  return (
    <FieldSet className="w-full">
      <FieldLegend className="flex w-full items-center justify-between">
        Турниры
        <Button size="sm" variant="outline" onClick={openCreate}>
          <PlusIcon /> Создать
        </Button>
      </FieldLegend>

      <FieldSeparator />

      <div className="flex flex-col gap-2">
        {loading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Загрузка...</p>
        ) : tournaments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Турниров пока нет</p>
        ) : (
          tournaments.map(t => (
            <div key={t._id} className="flex items-start gap-3 rounded-lg border px-4 py-3">
              <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                <span className="font-medium truncate">{t.title}</span>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="size-3" />
                    {formatEventDate(new Date(t.date), timezoneOffset)}
                  </span>
                  <span className="flex items-center gap-1">
                    <UsersIcon className="size-3" />
                    {t.minTeamSize === t.maxTeamSize ? t.minTeamSize : `${t.minTeamSize}–${t.maxTeamSize}`} уч.
                  </span>
                  <span>{t.registrationsCount} команд</span>
                </div>
                {t.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon-sm" variant="ghost" onClick={() => openEdit(t)}>
                  <PencilIcon />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteId(t._id)}
                >
                  <Trash2Icon />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={open => { if (!open) setDialogOpen(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Редактировать турнир" : "Новый турнир"}</DialogTitle>
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
            <div className="flex gap-3">
              <Field className="flex-1">
                <FieldLabel>Мин. участников*</FieldLabel>
                <Input
                  type="number"
                  min={1}
                  value={form.minTeamSize}
                  onChange={e => setForm(f => ({ ...f, minTeamSize: e.target.value }))}
                />
              </Field>
              <Field className="flex-1">
                <FieldLabel>Макс. участников*</FieldLabel>
                <Input
                  type="number"
                  min={1}
                  value={form.maxTeamSize}
                  onChange={e => setForm(f => ({ ...f, maxTeamSize: e.target.value }))}
                />
              </Field>
            </div>
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

      <Dialog open={!!deleteId} onOpenChange={open => { if (!open) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отменить турнир?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Все регистрации будут удалены. Это действие нельзя отменить.</p>
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
