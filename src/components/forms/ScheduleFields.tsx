import { nextDates, dateLabel } from "../../utils/format";
import { slots } from "../../services/catalog";
import { CalendarDays, Clock3, Check } from "lucide-react";
export function DateSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (date: string) => void;
}) {
  return (
    <div className="date-selector" role="group" aria-label="Pickup date">
      {nextDates().map((d, i) => (
        <button
          className={`date-option ${d === value ? "selected" : ""}`}
          key={d}
          onClick={() => onChange(d)}
          aria-pressed={d === value}
        >
          <span>
            {i === 0 ? "Tomorrow" : dateLabel(d, { weekday: "short" })}
          </span>
          <strong>{new Date(d + "T12:00:00").getDate()}</strong>
          <span>{dateLabel(d, { month: "short" })}</span>
        </button>
      ))}
    </div>
  );
}
export function TimeSlotSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (slot: string) => void;
}) {
  return (
    <div className="slot-selector" role="group" aria-label="Pickup time">
      {slots.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`slot-option ${value === s ? "selected" : ""}`}
          aria-pressed={value === s}
        >
          {s}
          {value === s && <Check size={14} />}
        </button>
      ))}
    </div>
  );
}
export function ScheduleFields({
  date,
  slot,
  onDate,
  onSlot,
}: {
  date: string;
  slot: string;
  onDate: (d: string) => void;
  onSlot: (s: string) => void;
}) {
  return (
    <>
      <h3 className="icon-heading">
        <CalendarDays size={19} />
        Pickup date
      </h3>
      <DateSelector value={date} onChange={onDate} />
      {date && (
        <>
          <h3 className="icon-heading space-top">
            <Clock3 size={19} />
            Pickup time
          </h3>
          <TimeSlotSelector value={slot} onChange={onSlot} />
        </>
      )}
    </>
  );
}
