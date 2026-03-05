import Orb from "@/components/orb";
import { getConfig } from "@/lib/config";

export default async function Hero() {
  const config = await getConfig();

  return (<div className={"h-dvh flex flex-col gap-10 justify-center items-center px-10  overflow-hidden"}>
    <div className="absolute inset-0 -z-1 bg-linear-to-b from-primary/10 via-transparent to-transparent"/>
    <div className="absolute inset-0 -z-2 bg-background/50"/>
    <div className="absolute inset-0 -z-3 overflow-hidden">
      <Orb scaleMode={"max"} speed={1.5}/>
    </div>
    <div className={"text-3xl sm:text-5xl font-bold"}>{config.name}</div>
    <div className={"text-md sm:text-lg  max-w-lg text-center"}>{config.briefDescription}</div>
  </div>);
}
