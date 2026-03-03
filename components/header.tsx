import Nav from './nav'
import Image from "next/image";
import Login from "@/components/login-button"
import { headers } from "next/headers";
import Link from "next/link";

export default async function Header() {
  const headersList = await headers();
  const role = headersList.get('x-user-role');

  return (<header className={"absolute w-full px-5 sm:px-10 py-3 flex flex-row gap-5 bg-background"}>
    <Logo/>
    <Nav/>
    <div className="mx-auto"/>
    <Login authorized={role !== null} />
  </header>);
}

function Logo() {
  return (
    <Link href={"/"}>
      <Image src={"logo.svg"} width={100} height={100} alt={"Logo"} className={"w-10 aspect-square"} />
    </Link>
  );
}
