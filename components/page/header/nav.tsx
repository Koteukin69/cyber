"use client"
import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const links: {name:string, href:string}[] = [
  {name:"Бронирование", href:"/book"},
  {name:"Турниры", href:"/tournaments"},
  {name:"Достижения", href:"/advancements"},
  {name:"Команды", href:"/team"},
  {name:"События", href:"/events"},
  {name:"API", href:"/public_api"},
]
export default function Nav({isColumn}: {isColumn?: boolean}) {
  return (<NavigationMenu className={isColumn ? "items-start" : ""}>
    <NavigationMenuList>
      <NavigationMenuItem className={`flex gap-2 ${isColumn ? "flex-col" : ""}`}>
        {links.map((link, i) => (
          <NavigationMenuLink key={i} asChild className={navigationMenuTriggerStyle()}>
            <Link href={link.href}>{link.name}</Link>
          </NavigationMenuLink>
        ))}
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>);
}