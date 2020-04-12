import React, { useMemo } from "react";

import { Workout as IWorkout, Units } from "../lib/workout";
import { Action } from "../lib/reducer";
import { func, DisplayMode, getVolumeStringFromWorkouts } from "../lib/utils";
import { Card } from "./Card";
import { Workout } from "./Workout";

interface WeekProps {
  allWorkouts: IWorkout[];
  weekNumber: number;
  units: Units;
  displayUnits: Units;
  dispatch: func<Action>;
  displayMode: DisplayMode;
  goalDate: Date;
}

export const Week = React.memo(function({
  weekNumber,
  allWorkouts,
  units,
  displayUnits,
  dispatch,
  displayMode,
  goalDate
}: WeekProps) {
  const weekStartIndex = weekNumber * 7;
  const weekEndIndex = Math.min(
    weekStartIndex + 7,
    allWorkouts.length
  );
  const weekWorkouts = useMemo(
    () => allWorkouts.slice(weekStartIndex, weekEndIndex),
    [allWorkouts, weekStartIndex, weekEndIndex]
  );
  const volumeString = useMemo(
    () => getVolumeStringFromWorkouts(weekWorkouts, units, displayUnits),
    [weekWorkouts, units, displayUnits]
  );

  return (
    <Card key={weekNumber}>
      <h3>
        <span className="primary">Week {weekNumber + 1}</span>&nbsp;&nbsp;
        <small>Total volume: {volumeString}</small>
      </h3>
      <div className="workouts-container">
        {weekWorkouts.map((workout, index) => (
          <Workout
            {...workout}
            workoutCount={allWorkouts.length}
            workoutIndex={weekStartIndex + index}
            goalDate={goalDate}
            key={workout.id}
            dispatch={dispatch}
            units={units}
            displayUnits={displayUnits}
            displayMode={displayMode}
          />
        ))}
      </div>
    </Card>
  );
});