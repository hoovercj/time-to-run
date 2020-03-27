import React from "react";

import "./Plan.css";

import { ScheduledPlan, ScheduledWorkout } from "../lib/workout";
import { chunkArray, getLongDateString, getDayOfWeekString, getShortDateString } from "../lib/utils";
import { formatWorkout } from "../lib/formatter";
import { Card } from "./Card";

export interface PlanProps {
  plan: ScheduledPlan
}

export function Plan({ plan }: PlanProps) {
  const { workouts, goalDate, title } = plan;
  const weeks: ScheduledWorkout[][] = chunkArray(workouts, 7);

  return (
    <div>
      <h2>{title}</h2>
      <div>Goal Race: {getLongDateString(goalDate)}</div>
      {weeks.map((week, index) => Week({ workouts: week, index: index }))}
    </div>
  );
}

export interface WeekProps {
  index: number;
  workouts: ScheduledWorkout[];
}

export function Week({ workouts, index }: WeekProps) {
  const volume = workouts.reduce((total, workout) => total + workout.totalDistance, 0)

  return (
    <Card>
        <h3>Week {index}&nbsp;&nbsp;<small>Total volume: {volume}</small></h3>
        {workouts.map(workout => Workout({ workout: workout }))}
    </Card>
  );
}

export interface WorkoutProps {
  workout: ScheduledWorkout;
}

export function Workout({ workout }: WorkoutProps) {
  const { description, date, inputUnits, outputUnits } = workout;
  return (
    <div className="workout">
      <div className="date">{getDayOfWeekString(date)} - {getShortDateString(date)}</div>
      <div className="description">{formatWorkout(description, inputUnits, outputUnits)}</div>
    </div>
  );
}
