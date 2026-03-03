import Orb from "@/components/orb";

export default function Hero() {


  return (<div className={"h-dvh flex flex-col gap-10 justify-center items-center px-10"}>
    <div className="absolute inset-0 -z-1 bg-linear-to-b from-primary/10 via-transparent to-transparent"/>
    <div className="absolute inset-0 -z-2 bg-background/50"/>
    <div className="absolute inset-0 -z-3">
      <Orb />
    </div>
    <div className={"text-3xl sm:text-5xl font-bold"}>Кибер Арена</div>
    <div className={"text-md sm:text-lg  max-w-lg text-center"}>Сервис, который помогает студентам бронировать зоны, видеть занятость и развивать активность вокруг арены</div>
  </div>);
}
