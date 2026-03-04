import ProfileForm from "@/components/page/profile-form";
import {groups} from "@/lib/groups";

export default async function Profile() {
  return <div className={"min-h-dvh px-5 py-30 flex flex-col items-center gap-10"}>
    <ProfileForm groups={groups}/>
  </div>
}