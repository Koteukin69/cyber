"use client";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const links: {name:string, href:string}[] = [
  {name:"Бронирование", href:"/booking"},
  {name:"Турниры", href:"/tournaments"},
  {name:"Достижения", href:"/advancements"},
  {name:"Команды", href:"/team"},
  {name:"События", href:"/events"},
  {name:"API", href:"/public_api"},
];

const adminLinks:{name: string, href:string}[] = [
  {name: "Основное", href: "/admin"},
  {name: "Бронирование", href: "/admin/booking"},
  {name: "Турниры", href: "/admin/tournaments"},
];

export default function Nav({isColumn, isAdmin}: {isColumn?: boolean, isAdmin: boolean}) {
  return (<NavigationMenu viewport={false} className={isColumn ? "flex-col items-start justify-start" : ""}>
    <NavigationMenuList className={`flex gap-2 ${isColumn ? "flex-col items-start" : ""}`}>
      {links.map((link, i) => (
        <NavigationMenuItem key={i}>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href={link.href}>{link.name}</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      ))}
      {isAdmin ? (
        <NavigationMenuItem>
          <NavigationMenuTrigger>Admin</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className={"flex flex-col gap-1"}>{adminLinks.map((link, i) => (
              <li key={i}>
                <NavigationMenuLink asChild>
                  <Link href={link.href}>{link.name}</Link>
                </NavigationMenuLink>
              </li>
            ))}</ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      ) : (<></>)}
    </NavigationMenuList>
  </NavigationMenu>);
}