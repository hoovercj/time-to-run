import React from "react";
import { addDays, chunkArray } from "../../lib/utils";
import { BuiltInPlan } from "../../lib/workout";
import { Week } from "./Week";
import { WeekDay, WeekDays } from "./model";

export interface ScheduleProps {
  plan: BuiltInPlan;
  endDate: any;
  firstDayOfWeek?: any;
  onSave: any;
}

export const Schedule = (props: ScheduleProps) => {
  const { plan, endDate } = props;
  const firstDayOfWeek = props.firstDayOfWeek ?? 1; // Default to Monday

  const firstWorkoutDate = addDays(endDate, -1 * (plan.workouts.length - 1));
  const firstWorkoutDay = firstWorkoutDate.getDay();
  // Examples:
  // firstWorkoutDay = 2 (Tuesday)
  // firstDayOfWeek = 5 (Friday)
  // (2 + 7) - 5) % 7 = 4
  // firstWorkoutDay = 2 (Tuesday)
  // firstDayOfWeek = 2 (Tuesday)
  // (2 + 7) - 2) % 7 = 0
  const numInitialPaddingDays = ((firstWorkoutDay + 7) - firstDayOfWeek) % 7;
  const firstScheduleDate = addDays(firstWorkoutDate, -1 * numInitialPaddingDays);
  // Examples:
  // (7 - (49 % 7)) % 7 = 0
  // (7 - (36 % 7)) % 7 = 6
  const numEndingPaddingDays = (7 - (plan.workouts.length + numInitialPaddingDays) % 7) % 7;
  const weekDays: Array<WeekDay> = [];
  for (let i = 0; i < numInitialPaddingDays; i++) {
    weekDays.push({
      date: addDays(firstScheduleDate, weekDays.length)
    });
  }

  for (let i = 0; i < plan.workouts.length; i++) {
    weekDays.push({
      date: addDays(firstScheduleDate, weekDays.length),
      workout: plan.workouts[i],
    });
  }

  for (let i = 0; i < numEndingPaddingDays; i++) {
    weekDays.push({
      date: addDays(firstScheduleDate, weekDays.length)
    });
  }

  const weeks = chunkArray(weekDays, 7) as any as Array<WeekDays>;
  return (<>
    {weeks.map((week, index) => {
      return (
        <Week
          key={index}
          weekNumber={index + 1}
          onSave={() => {}}
          days={week}
        />
      )
    })}
  </>);
}