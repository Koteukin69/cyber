import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { getConfig } from "@/lib/config";

const PLATFORM_LINKS: { name: string; href: string }[] = [
  { name: "Бронирование", href: "/booking" },
  { name: "Турниры", href: "/tournaments" },
  { name: "Команды", href: "/team" },
  { name: "События", href: "/events" },
];

const ACCOUNT_LINKS: { name: string; href: string }[] = [
  { name: "Профиль", href: "/profile" },
  { name: "Мои бронирования", href: "/booking/my" },
];

export default async function Footer() {
  const config = await getConfig();
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-full border-t bg-background">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="px-5 md:px-20 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[2fr_1.5fr_1.5fr]">
          <BrandColumn name={config.name} description={config.briefDescription} />
          <FooterLinkSection title="Платформа" links={PLATFORM_LINKS} />
          <FooterLinkSection title="Аккаунт" links={ACCOUNT_LINKS} />
        </div>
      </div>

      <Separator />

      <div className="px-5 md:px-20 py-4 flex items-center justify-between">
        <p className="text-[16px] text-muted-foreground">© {year} {config.name}</p>
        <p className="text-[16px] text-muted-foreground">{config.name}</p>
      </div>
    </footer>
  );
}

function BrandColumn({ name, description }: { name: string; description: string }) {
  return (
    <div className="flex flex-col gap-4">
      <Link href="/" className="flex items-center gap-3 w-fit">
        <Image src="/logo.svg" width={40} height={40} alt="Logo" className="w-10 aspect-square" />
        <span className="text-[20px] font-semibold">{name}</span>
      </Link>
      <p className="text-[16px] text-muted-foreground max-w-xs leading-relaxed">{description}</p>
    </div>
  );
}

function FooterLinkSection({ title, links }: { title: string; links: { name: string; href: string }[] }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[16px] font-semibold uppercase tracking-wider">{title}</p>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-[16px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
