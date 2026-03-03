import ProfileForm from "@/components/page/profile-form";
import {groups} from "@/lib/groups";

export default async function Profile() {
  return <div className={"min-h-dvh px-10 py-30 flex justify-center"}>
    <ProfileForm groups={groups}/>
  </div>
}