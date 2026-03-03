import {Button} from "@/components/ui/button";
import Link from "next/link";

export default function Login({authorized}: {authorized: boolean}) {
  return (
    <Button variant={"secondary"} asChild>
      {authorized ? (
        <Link href="/profile">
          Профиль
        </Link>
        ) : (
        <Link href={"/login"}>
          Войти
        </Link>
      )}
    </Button>
  );
}