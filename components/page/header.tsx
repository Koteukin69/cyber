import Nav from './header/nav'
import Image from "next/image";
import Login from "@/components/page/header/login-button"
import { headers } from "next/headers";
import Link from "next/link";
import {Menu} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {Separator} from "@/components/ui/separator";


export default async function Header() {
  const headersList = await headers();
  const role = headersList.get('x-user-role');

  return (<header className={"absolute w-full px-5 sm:px-10 py-3 flex items-center gap-5 bg-background"}>
    <Logo />
    <div className={"hidden lg:flex w-full"}>
      <Nav isAdmin={role === "admin"} />
      <div className="mx-auto" />
      <Login authorized={role !== null} />
    </div>
    <div className={"lg:hidden ml-auto flex justify-center"}>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant={"ghost"} size={"icon"}><Menu/></Button>
        </SheetTrigger>
        <SheetContent className={"flex flex-col py-10 px-5"}>
          <Link href={"/"}><SheetTitle>Кибер Арена</SheetTitle></Link>
          <Separator/>
          <Nav isAdmin={role === "admin"} isColumn/>
          <div className="my-auto" />
          <Login authorized={role !== null} />
        </SheetContent>
      </Sheet>
    </div>
  </header>);
}

function Logo() {
  return (
    <Link href={"/"}>
      <Image src={"/logo.svg"} width={100} height={100} alt={"Logo"} className={"w-10 aspect-square"} />
    </Link>
  );
}
