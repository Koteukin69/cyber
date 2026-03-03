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

export default function ProfileForm({groups}: {groups: string[]}) {
  const [group, setGroup] = useState("");
  const [fio, setFio] = useState("");
  const [steam, setSteam] = useState("");
  const [error, setError] = useState("");


  return (<FieldSet className={"max-w-sm w-full"}>
    <FieldLegend>Профиль</FieldLegend>
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
        <Button type="submit">
          Подтвердить
        </Button>
        <Button variant="outline" type="button">
          Отменить
        </Button>
      </Field>
      <FieldError>{error}</FieldError>
    </FieldGroup>
  </FieldSet>);
}