import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import {collections} from "@/lib/db/collections";
import {ObjectId} from "mongodb";
import {notFound} from "next/navigation";
import {ExternalLink} from "lucide-react";
import Link from "next/link";

export default async function ProfilePage({userSlug}: {userSlug: string}) {
  let user;
  try {
    const users = await collections.users();
    user = await users.findOne({_id: new ObjectId(userSlug)});
  } catch {
    notFound();
  }
  if (!user) notFound();

  return (
    <FieldSet className={"max-w-sm w-full"}>
      <FieldLegend className={"w-full flex justify-between items-center"}>
        Профиль
      </FieldLegend>
      <FieldSeparator/>
      <FieldGroup>
        <Field>
          <FieldLabel>ФИО</FieldLabel>
          <FieldContent>{user.fio ?? "—"}</FieldContent>
        </Field>
        <Field>
          <FieldLabel>Группа</FieldLabel>
          <FieldContent>{user.group ?? "—"}</FieldContent>
        </Field>
        <Field>
          <FieldLabel>Профиль Steam</FieldLabel>
          <FieldContent>
            {user.steam
              ? <Link href={user.steam} target="_blank" className="flex items-center gap-1 underline">
                  {user.steam} <ExternalLink size={14}/>
                </Link>
              : "—"
            }
          </FieldContent>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
