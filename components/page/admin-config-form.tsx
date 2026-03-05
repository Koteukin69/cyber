"use client";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { TIMEZONE_OPTIONS, DEFAULT_TIMEZONE } from "@/lib/timezones";

interface ConfigState {
  name: string;
  briefDescription: string;
  description: string;
  emailSubject: string;
  emailHtml: string;
  timezone: number;
  workStart: number;
  slotDuration: number;
  slotCount: number;
}

const EMPTY: ConfigState = {
  name: "",
  briefDescription: "",
  description: "",
  emailSubject: "",
  emailHtml: "",
  timezone: DEFAULT_TIMEZONE,
  workStart: 9,
  slotDuration: 60,
  slotCount: 9,
};

export default function AdminConfigForm() {
  const [values, setValues] = useState<ConfigState>(EMPTY);
  const [saved, setSaved] = useState<ConfigState>(EMPTY);
  const [error, setError] = useState("");

  const isDirty = Object.keys(values).some(
    (key) => values[key as keyof ConfigState] !== saved[key as keyof ConfigState]
  );

  useEffect(refresh, []);

  function refresh() {
    setError("");
    fetch("/api/admin/config")
      .then((res) => res.json())
      .then((data: ConfigState) => {
        setValues(data);
        setSaved(data);
      });
  }

  function set(field: keyof ConfigState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function setTimezone(e: React.ChangeEvent<HTMLSelectElement>) {
    setValues(prev => ({ ...prev, timezone: Number(e.target.value) }));
  }

  function setNumber(field: keyof ConfigState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues(prev => ({ ...prev, [field]: Number(e.target.value) }));
  }

  async function submit() {
    await fetch("/api/admin/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    }).then(async (res) =>
      res.status === 200 ? refresh() : setError((await res.json()).error)
    );
  }

  return (
    <FieldSet className={"max-w-lg w-full"}>
      <FieldGroup>
        <FieldLegend>Общая информация</FieldLegend>
        <Field>
          <FieldLabel>Название</FieldLabel>
          <Input value={values.name} onChange={set("name")} placeholder="Кибер Арена" />
        </Field>
        <Field>
          <FieldLabel>Краткое описание</FieldLabel>
          <Input
            value={values.briefDescription}
            onChange={set("briefDescription")}
            placeholder="Один абзац для главной страницы"
          />
        </Field>
        <Field>
          <FieldLabel>Полное описание</FieldLabel>
          <Textarea
            value={values.description}
            onChange={set("description")}
            rows={4}
            placeholder="Расширенное описание"
          />
        </Field>
        <Field>
          <FieldLabel>Часовой пояс</FieldLabel>
          <select
            value={values.timezone}
            onChange={setTimezone}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
          >
            {TIMEZONE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </Field>
      </FieldGroup>

      <FieldSeparator />

      <FieldGroup>
        <FieldLegend variant="label">Часы работы</FieldLegend>
        <Field>
          <FieldLabel>Начало (час)</FieldLabel>
          <FieldDescription>0–23, например 9 = 09:00</FieldDescription>
          <Input type="number" min={0} max={23} value={values.workStart} onChange={setNumber("workStart")} />
        </Field>
        <Field>
          <FieldLabel>Длительность слота (мин)</FieldLabel>
          <Input type="number" min={1} max={120} value={values.slotDuration} onChange={setNumber("slotDuration")} />
        </Field>
        <Field>
          <FieldLabel>Количество слотов</FieldLabel>
          <Input type="number" min={1} max={24} value={values.slotCount} onChange={setNumber("slotCount")} />
        </Field>
      </FieldGroup>

      <FieldSeparator />

      <FieldGroup>
        <FieldLegend variant="label">Email-шаблоны</FieldLegend>
        <Field>
          <FieldLabel>Тема письма</FieldLabel>
          <FieldDescription>Доступна переменная: <code>{"<%= name %>"}</code></FieldDescription>
          <Input
            value={values.emailSubject}
            onChange={set("emailSubject")}
            placeholder="Вход в <%= name %>"
          />
        </Field>
        <Field>
          <FieldLabel>HTML письма</FieldLabel>
          <FieldDescription>
            Доступны переменные: <code>{"<%= name %>"}</code>, <code>{"<%= code %>"}</code>
          </FieldDescription>
          <Textarea
            value={values.emailHtml}
            onChange={set("emailHtml")}
            rows={14}
            className="font-mono text-xs"
            placeholder="<html>..."
          />
        </Field>
      </FieldGroup>

      <FieldGroup>
        <Field orientation={"horizontal"}>
          <Button type="submit" onClick={submit} disabled={!isDirty}>
            Подтвердить
          </Button>
          <Button variant="outline" type="button" onClick={refresh} disabled={!isDirty}>
            Отменить
          </Button>
        </Field>
        <FieldError>{error}</FieldError>
      </FieldGroup>
    </FieldSet>
  );
}
