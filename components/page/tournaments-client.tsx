"use client";

import { useState, useEffect, useCallback } from "react";
import { CalendarIcon, UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatEventDate } from "@/lib/timezones";

interface CaptainTeam {
  _id: string;
  name: string;
  membersCount: number;
}

interface TournamentCard {
  _id: string;
  title: string;
  description: string | null;
  date: string;
  minTeamSize: number;
  maxTeamSize: number;
  registrationsCount: number;
  isRegistered?: boolean;
}

const NO_TEAM = "__none__";

export default function TournamentsClient({
  captainTeams,
  timezoneOffset,
}: {
  captainTeams: CaptainTeam[];
  timezoneOffset: number;
}) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(NO_TEAM);
  const [tournaments, setTournaments] = useState<TournamentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTournaments = useCallback(async (teamId: string) => {
    setLoading(true);
    setError(null);
    const url = teamId !== NO_TEAM
      ? `/api/tournaments?teamId=${teamId}`
      : "/api/tournaments";
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setTournaments(data.tournaments);
    } else {
      setError("Ошибка при загрузке турниров");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTournaments(selectedTeamId);
  }, [selectedTeamId, fetchTournaments]);

  async function handleRegister(tournamentId: string) {
    if (selectedTeamId === NO_TEAM) return;
    setRegistering(tournamentId);
    setError(null);
    const res = await fetch(`/api/tournaments/${tournamentId}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId: selectedTeamId }),
    });
    if (res.ok) {
      await fetchTournaments(selectedTeamId);
    } else {
      const data = await res.json();
      setError(data.error ?? "Ошибка регистрации");
    }
    setRegistering(null);
  }

  async function handleUnregister(tournamentId: string) {
    if (selectedTeamId === NO_TEAM) return;
    setRegistering(tournamentId);
    setError(null);
    const res = await fetch(`/api/tournaments/${tournamentId}/register`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId: selectedTeamId }),
    });
    if (res.ok) {
      await fetchTournaments(selectedTeamId);
    } else {
      const data = await res.json();
      setError(data.error ?? "Ошибка отмены регистрации");
    }
    setRegistering(null);
  }

  const selectedTeam = captainTeams.find(t => t._id === selectedTeamId);

  return (
    <FieldSet className="w-full max-w-2xl">
      <FieldLegend>Турниры</FieldLegend>

      <FieldSeparator />

      {captainTeams.length > 0 && (
        <FieldGroup>
          <Field>
            <FieldLabel>Фильтр по команде</FieldLabel>
            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
              <SelectTrigger>
                <SelectValue placeholder="Без фильтра" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_TEAM}>Без фильтра</SelectItem>
                {captainTeams.map(team => (
                  <SelectItem key={team._id} value={team._id}>
                    {team.name} ({team.membersCount} уч.)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTeam && (
              <p className="text-xs text-muted-foreground">
                Показаны турниры, подходящие для команды «{selectedTeam.name}»
              </p>
            )}
          </Field>
        </FieldGroup>
      )}

      {error && (
        <p className="text-sm text-destructive px-1">{error}</p>
      )}

      <div className="flex flex-col gap-3 mt-2">
        {loading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Загрузка...</p>
        ) : tournaments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            {selectedTeamId !== NO_TEAM
              ? "Нет подходящих турниров для этой команды"
              : "Ближайших турниров пока нет"}
          </p>
        ) : (
          tournaments.map(t => (
            <div key={t._id} className="rounded-lg border px-5 py-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <span className="font-medium">{t.title}</span>
                <span className="text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1.5 shrink-0">
                  <CalendarIcon className="size-3.5" />
                  {formatEventDate(new Date(t.date), timezoneOffset)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <UsersIcon className="size-3.5" />
                    {t.minTeamSize === t.maxTeamSize
                      ? `${t.minTeamSize} участников`
                      : `${t.minTeamSize}–${t.maxTeamSize} участников`}
                  </span>
                  <span>{t.registrationsCount} команд</span>
                </div>
                {selectedTeamId !== NO_TEAM && (
                  t.isRegistered ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive shrink-0"
                      disabled={registering === t._id}
                      onClick={() => handleUnregister(t._id)}
                    >
                      Отменить
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      disabled={registering === t._id}
                      onClick={() => handleRegister(t._id)}
                    >
                      Зарегистрировать
                    </Button>
                  )
                )}
              </div>
              {t.description && (
                <p className="text-sm text-muted-foreground">{t.description}</p>
              )}
            </div>
          ))
        )}
      </div>
    </FieldSet>
  );
}
