"use client";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useState, useEffect} from "react";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {AlertTriangleIcon, Link as LinkIcon} from "lucide-react";
import Link from "next/link";

export default function ProfileForm({groups, userSlug}: {groups: string[], userSlug: string}) {
  const [fio, setFio] = useState("");
  const [group, setGroup] = useState("");
  const [steam, setSteam] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState({ fio: "", group: "", steam: "" });
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const isDirty = fio !== saved.fio || group !== saved.group || steam !== saved.steam;

  useEffect(refresh, []);

  async function submit() {
    if (!fio || !group) {
      setError("Заполните обязательные поля");
      return;
    }
    await fetch("/api/profile", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({fio, group, steam}),
    }).then(async (res) => res.status === 200 ? refresh() : setError((await res.json()).error));
  }

  function refresh() {
    setError("");
    fetch("/api/profile")
    .then((res) => (res.json()))
    .then((user) => {
      setFio(user.fio ?? "");
      setGroup(user.group ?? "");
      setSteam(user.steam ?? "");
      setShowWarning(!user.fio || !user.group)
      setSaved({ fio: user.fio ?? "", group: user.group ?? "", steam: user.steam ?? "" });
    });
  }

  return (<>
    <Warning show={showWarning}/>
    <FieldSet className={"max-w-sm w-full"}>
      <FieldLegend className={"w-full flex justify-between items-center"}>
        Профиль
        <Button variant={"ghost"} size={"icon-sm"} asChild>
          <Link href={`/profile/${userSlug}`}><LinkIcon /></Link>
        </Button>
      </FieldLegend>
      <FieldSeparator/>
      <FieldGroup>
        <Field>
          <FieldLabel>ФИО*</FieldLabel>
          <Input id="fio" value={fio} onChange={e => setFio(e.target.value)} placeholder="Иванов Иван Иванович" />
        </Field>
        <Field>
          <FieldLabel>Группа*</FieldLabel>
          <Combobox items={groups} value={group} onValueChange={e => setGroup(e ?? "")} >
            <ComboboxInput placeholder="Группа" />
            <ComboboxContent>
              <ComboboxEmpty>Не найдено.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Field>
        <Field>
          <FieldLabel>Профиль Steam</FieldLabel>
          <Input id={"steam_url"} value={steam} onChange={e => setSteam(e.target.value)} placeholder="https://steamcommunity.com/id/*" />
        </Field>
      </FieldGroup>
      <FieldGroup>
        <Field orientation={"horizontal"}>
          <Button type="submit" onClick={submit} disabled={!isDirty} >
            Подтвердить
          </Button>
          <Button variant="outline" type="button" onClick={refresh} disabled={!isDirty}>
            Отменить
          </Button>
        </Field>
        <Field orientation={"horizontal"} className={"justify-center"}>
          <Button variant={"link"} className={"text-destructive"} asChild>
            <Link href={"/logout"} prefetch={false}>Выйти</Link>
          </Button>
        </Field>
        <FieldError>{error}</FieldError>
      </FieldGroup>
    </FieldSet>
  </>);
}

export function Warning({show}: { show: boolean }) {
  return (
    <Alert className={`max-w-sm border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50 ${show ? "" : "hidden"}`}>
      <AlertTriangleIcon />
      <AlertTitle>Необходимо завершить регистрацию</AlertTitle>
      <AlertDescription>
        Заполните профиль чтобы получить доступ ко всему функционалу сайта.
      </AlertDescription>
    </Alert>
  )
}