import ProfileForm from "@/components/page/profile-form";
import {groups} from "@/lib/groups";
import { headers } from 'next/headers'

export default async function Profile() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id');

  return <div className={"px-5 py-30 flex flex-col items-center gap-10"}>
    <ProfileForm groups={groups} userSlug={userId ?? ""}/>
  </div>
}