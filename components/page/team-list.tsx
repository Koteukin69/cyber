"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SearchIcon, PlusIcon, UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field";

interface TeamCard {
  _id: string;
  name: string;
  membersCount: number;
  captainId: string | null;
  isMember: boolean;
}

export default function TeamList({ userId, hasFio }: { userId: string; hasFio: boolean }) {
  const [teams, setTeams] = useState<TeamCard[]>([]);
  const [search, setSearch] = useState("");
  const [myOnly, setMyOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchTeams = useCallback(async (searchVal: string, myOnlyVal: boolean) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchVal) params.set("search", searchVal);
    if (myOnlyVal) params.set("my", "true");
    const res = await fetch(`/api/teams?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setTeams(data.teams);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchTeams(search, myOnly), 200);
    return () => clearTimeout(timeout);
  }, [search, myOnly, fetchTeams]);

  async function handleCreate() {
    if (!newName.trim()) {
      setCreateError("Введите название команды");
      return;
    }
    setCreating(true);
    setCreateError("");
    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) {
      const { _id } = await res.json();
      setCreateOpen(false);
      setNewName("");
      window.location.href = `/team/${_id}`;
    } else {
      const data = await res.json();
      setCreateError(data.error ?? "Ошибка при создании");
    }
    setCreating(false);
  }

  return (
    <FieldSet className="w-full max-w-2xl">
      <FieldLegend className="flex w-full items-center justify-between">
        Команды
        {userId && (
          hasFio ? (
            <Dialog open={createOpen} onOpenChange={open => { setCreateOpen(open); if (!open) { setNewName(""); setCreateError(""); } }}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <PlusIcon /> Создать
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Новая команда</DialogTitle>
                </DialogHeader>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Название</FieldLabel>
                    <Input
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleCreate()}
                      placeholder="Название команды"
                      maxLength={50}
                      autoFocus
                    />
                  </Field>
                  <FieldError>{createError}</FieldError>
                </FieldGroup>
                <DialogFooter>
                  <Button onClick={handleCreate} disabled={creating}>
                    Создать
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <Button size="sm" variant="outline" disabled>
                <PlusIcon /> Создать
              </Button>
              <span className="text-xs text-muted-foreground">
                <Link href="/profile" className="underline underline-offset-2 hover:text-foreground transition-colors">Заполните профиль</Link>
              </span>
            </div>
          )
        )}
      </FieldLegend>

      <FieldSeparator />

      <FieldGroup>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-9"
              placeholder="Поиск по названию или участникам..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {userId && (
            <Button
              variant={myOnly ? "default" : "outline"}
              onClick={() => setMyOnly(v => !v)}
            >
              Мои команды
            </Button>
          )}
        </div>
      </FieldGroup>

      <div className="flex flex-col gap-2 mt-2">
        {loading ? (
          <div className="text-sm text-muted-foreground py-8 text-center">Загрузка...</div>
        ) : teams.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            {search || myOnly ? "Ничего не найдено" : "Команд пока нет"}
          </div>
        ) : (
          teams.map(team => (
            <Link
              key={team._id}
              href={`/team/${team._id}`}
              className="flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-accent transition-colors"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{team.name}</span>
                {team.isMember && (
                  <span className="text-xs text-muted-foreground">
                    {team.captainId === userId ? "Капитан" : "Участник"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <UsersIcon className="size-4" />
                <span>{team.membersCount}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </FieldSet>
  );
}
