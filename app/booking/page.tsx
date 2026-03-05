import BookingCard from "@/components/booking/booking-card"
import {FieldContent, FieldLegend, FieldSet} from "@/components/ui/field";

export default async function Booking() {
  return (
    <FieldSet className="w-full max-w-2xl">
      <FieldLegend className={"w-full flex justify-between items-center"}>
        Бронирование
      </FieldLegend>
      <FieldContent>
        <BookingCard/>
      </FieldContent>
    </FieldSet>
  );
}