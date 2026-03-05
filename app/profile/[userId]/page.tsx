import ProfilePage from "@/components/page/profile-page";

export default async function Profile({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  return <div className={"px-5 py-30 flex flex-col items-center gap-10"}>
    <ProfilePage userSlug={userId} />
  </div>
}