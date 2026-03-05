"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, PencilIcon, UserIcon } from "lucide-react";
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";

interface TeamMember {
  userId: string;
  joinedAt: string;
  fio?: string | null;
}

interface Application {
  userId: string;
  fio?: string | null;
}

interface TeamData {
  _id: string;
  name: string;
  isCaptain: boolean;
  isMember: boolean;
  hasApplied: boolean;
  members: TeamMember[];
  applications?: Application[];
}

export default function TeamDetail({ teamId, userId, hasFio }: { teamId: string; userId: string; hasFio: boolean }) {
  const router = useRouter();
  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionError, setActionError] = useState("");

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameName, setRenameName] = useState("");
  const [renameError, setRenameError] = useState("");
  const [renaming, setRenaming] = useState(false);

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    setActionError("");
    const res = await fetch(`/api/teams/${teamId}`);
    if (res.status === 404) {
      setNotFound(true);
    } else if (res.ok) {
      setTeam(await res.json());
    }
    setLoading(false);
  }, [teamId]);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  async function handleApply() {
    setActionError("");
    const res = await fetch(`/api/teams/${teamId}/apply`, { method: "POST" });
    if (res.ok) fetchTeam();
    else setActionError((await res.json()).error ?? "Ошибка");
  }

  async function handleLeave() {
    setActionError("");
    const res = await fetch(`/api/teams/${teamId}/leave`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      if (data.deleted) {
        router.push("/team");
      } else {
        fetchTeam();
      }
    } else {
      setActionError((await res.json()).error ?? "Ошибка");
    }
  }

  async function handleAccept(applicantId: string) {
    setActionError("");
    const res = await fetch(`/api/teams/${teamId}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicantId }),
    });
    if (res.ok) fetchTeam();
    else setActionError((await res.json()).error ?? "Ошибка");
  }

  async function handleReject(applicantId: string) {
    setActionError("");
    const res = await fetch(`/api/teams/${teamId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicantId }),
    });
    if (res.ok) fetchTeam();
    else setActionError((await res.json()).error ?? "Ошибка");
  }

  async function handleRename() {
    if (!renameName.trim()) {
      setRenameError("Введите название");
      return;
    }
    setRenaming(true);
    setRenameError("");
    const res = await fetch(`/api/teams/${teamId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: renameName.trim() }),
    });
    if (res.ok) {
      setRenameOpen(false);
      fetchTeam();
    } else {
      setRenameError((await res.json()).error ?? "Ошибка");
    }
    setRenaming(false);
  }

  if (loading) {
    return (
      <div className="w-full max-w-2xl text-sm text-muted-foreground py-16 text-center">
        Загрузка...
      </div>
    );
  }

  if (notFound || !team) {
    return (
      <div className="w-full max-w-2xl flex flex-col items-center gap-4 py-16">
        <p className="text-muted-foreground">Команда не найдена</p>
        <Button variant="outline" asChild>
          <Link href="/team"><ArrowLeftIcon /> К командам</Link>
        </Button>
      </div>
    );
  }

  const captainId = team.members[0]?.userId;

  return (
    <FieldSet className="w-full max-w-2xl">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/team"><ArrowLeftIcon /></Link>
        </Button>
        <FieldLegend className="flex-1 flex items-center justify-between mb-0">
          <span>{team.name}</span>
          {team.isCaptain && (
            <Dialog
              open={renameOpen}
              onOpenChange={open => {
                setRenameOpen(open);
                if (open) setRenameName(team.name);
                else setRenameError("");
              }}
            >
              <DialogTrigger asChild>
                <Button size="icon-sm" variant="ghost">
                  <PencilIcon />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Переименовать команду</DialogTitle>
                </DialogHeader>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Название</FieldLabel>
                    <Input
                      value={renameName}
                      onChange={e => setRenameName(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleRename()}
                      maxLength={50}
                      autoFocus
                    />
                  </Field>
                  <FieldError>{renameError}</FieldError>
                </FieldGroup>
                <DialogFooter>
                  <Button onClick={handleRename} disabled={renaming}>Сохранить</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </FieldLegend>
      </div>

      <FieldSeparator />

      <FieldGroup>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Участники ({team.members.length})
          </span>
        </div>
        <div className="flex flex-col gap-1">
          {team.members.map((member, i) => (
            <Link
              key={member.userId}
              href={`/profile/${member.userId}`}
              className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent transition-colors"
            >
              <UserIcon className="size-4 text-muted-foreground shrink-0" />
              <span className="text-sm flex-1">{member.fio ?? member.userId}</span>
              {member.userId === captainId && (
                <span className="text-xs text-muted-foreground">Капитан</span>
              )}
            </Link>
          ))}
        </div>
      </FieldGroup>

      {!team.isMember && userId && (
        <FieldGroup>
          <FieldSeparator />
          <Field orientation="horizontal">
            {!hasFio ? (
              <Button variant="outline" disabled>Подать заявку</Button>
            ) : team.hasApplied ? (
              <Button variant="outline" disabled>Заявка отправлена</Button>
            ) : (
              <Button onClick={handleApply}>Подать заявку</Button>
            )}
          </Field>
          {!hasFio && (
            <p className="text-xs text-muted-foreground">
              <Link href="/profile" className="underline underline-offset-2 hover:text-foreground transition-colors">Заполните профиль</Link>, чтобы вступить в команду
            </p>
          )}
          <FieldError>{actionError}</FieldError>
        </FieldGroup>
      )}

      {team.isMember && !team.isCaptain && (
        <FieldGroup>
          <FieldSeparator />
          <Field orientation="horizontal">
            <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={handleLeave}>
              Покинуть команду
            </Button>
          </Field>
          <FieldError>{actionError}</FieldError>
        </FieldGroup>
      )}

      {team.isCaptain && (
        <FieldGroup>
          <FieldSeparator />
          <Field orientation="horizontal">
            <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={handleLeave}>
              Покинуть команду
            </Button>
          </Field>
          <FieldError>{actionError}</FieldError>
        </FieldGroup>
      )}

      {team.isCaptain && team.applications && team.applications.length > 0 && (
        <FieldGroup>
          <FieldSeparator />
          <div className="text-sm font-medium">
            Заявки ({team.applications.length})
          </div>
          <div className="flex flex-col gap-1">
            {team.applications.map(app => (
              <div
                key={app.userId}
                className="flex items-center gap-3 rounded-md border px-3 py-2"
              >
                <Link
                  href={`/profile/${app.userId}`}
                  className="flex items-center gap-2 flex-1 hover:underline"
                >
                  <UserIcon className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-sm">{app.fio ?? app.userId}</span>
                </Link>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleAccept(app.userId)}>
                    Принять
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleReject(app.userId)}>
                    Отклонить
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </FieldGroup>
      )}

      {team.isCaptain && team.applications?.length === 0 && (
        <FieldGroup>
          <FieldSeparator />
          <p className="text-sm text-muted-foreground">Нет новых заявок</p>
        </FieldGroup>
      )}
    </FieldSet>
  );
}
