export default function BookingCard({width, height}: {width?: number, height?: number}) {
  return (<div className={`w-full aspect-[${width??10}/${height??10}] bg-gray-500`}>
    Бронирование
  </div>)
}