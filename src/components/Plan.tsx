import React from "react";

import "./Plan.css";

import { ScheduledPlan, ScheduledWorkout, Units } from "../lib/workout";
import {
  chunkArray,
  getLongDateString,
  getDayOfWeekString,
  getShortDateString,
  scaleNumber
} from "../lib/utils";
import { formatWorkoutFromTemplate } from "../lib/formatter";
import { Card } from "./Card";

export interface PlanProps {
  plan: ScheduledPlan;
}

// TODO: units are being duplicated throughout the tree
// Currently this is fine because they are always the same,
// but they could theoretically become out of sync. Normalize
// handling of units to eliminate this risk

export function Plan({ plan }: PlanProps) {
  const { workouts, goalDate, title } = plan;
  const weeks: ScheduledWorkout[][] = chunkArray(workouts, 7);

  return (
    <div>
      <h2>{title}</h2>
      <div className="goal-race">Goal Race: {getLongDateString(goalDate)}</div>
      {weeks.map((week, index) => (
        <Week
          key={index}
          workouts={week}
          index={index}
          displayUnits={plan.displayUnits}
        />
      ))}
    </div>
  );
}

export interface WeekProps {
  index: number;
  workouts: ScheduledWorkout[];
  displayUnits: Units;
}

export function Week({ workouts, index, displayUnits }: WeekProps) {
  const volume = workouts.reduce(
    (total, { totalDistance, units, displayUnits }) =>
      total + scaleNumber(totalDistance, units, displayUnits),
    0
  );

  return (
    <Card>
      <h3>
        Week {index + 1}&nbsp;&nbsp;
        <small>
          Total volume: {Math.round(volume).toString(10)} {displayUnits}
        </small>
      </h3>
      {workouts.map((workout, index) => <Workout key={index} workout={workout} />)}
    </Card>
  );
}

export interface WorkoutProps {
  workout: ScheduledWorkout;
}

export function Workout({ workout }: WorkoutProps) {
  const { description, date, units, displayUnits } = workout;
  return (
    <div className="workout">
      <div className="date">
        {getDayOfWeekString(date)} - {getShortDateString(date)}
      </div>
      <div className="description">
        {formatWorkoutFromTemplate(description, units, displayUnits)}
      </div>
    </div>
  );
}
