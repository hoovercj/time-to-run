import React from "react";
import { Week } from "./Week";
import { WeekDay, WeekDays } from "./model";

export interface WeeksProps {
  onSave: (day: WeekDay) => void;
  weeks: Array<WeekDays>;
}

export const Weeks = ({ onSave, weeks }: WeeksProps) => {
  return (
    <>
      {weeks.map((week, index) => (
        <Week
          key={week[0].date.getTime()}
          days={week}
          weekNumber={index + 1}
          onSave={onSave}
        />
      ))}
    </>
  )
}