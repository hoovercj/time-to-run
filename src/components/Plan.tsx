import React, { useState, useCallback } from "react";

import "./Plan.css";

import { ScheduledPlan, ScheduledWorkout, Units } from "../lib/workout";
import {
  chunkArray,
  func,
  getLongDateString,
  getDayOfWeekString,
  getShortDateString,
  getVolumeStringFromWorkouts
} from "../lib/utils";
import { formatWorkoutFromTemplate } from "../lib/formatter";
import { Card } from "./Card";

export interface PlanProps {
  plan: ScheduledPlan;
}

type Mode = "edit" | "view";
const DEFAULT_VIEWMODE: Mode = "edit";
const WEEK_LENGTH = 7;

export function Plan({ plan }: PlanProps) {
  const [viewMode, setViewMode] = useState<Mode>(DEFAULT_VIEWMODE);
  const [editedPlan, setEditedPlan] = useState<ScheduledPlan>({ ...plan });

  const { goalDate, title, units, displayUnits } = plan;

  const updateWorkout: func<ScheduledWorkout> = useCallback(
    (updatedWorkout: ScheduledWorkout) => {
      setEditedPlan(editedPlan => {
        const newState = {
          ...editedPlan,
          workouts: [...editedPlan.workouts]
        };

        const indexToUpdate = newState.workouts.findIndex(
          (workout: ScheduledWorkout) => workout.id === updatedWorkout.id
        );
        newState.workouts[indexToUpdate] = updatedWorkout;

        return newState;
      });
    },
    []
  );

  const weeks: ScheduledWorkout[][] = chunkArray(
    editedPlan.workouts,
    WEEK_LENGTH
  );

  return (
    <div>
      {/* TODO: make title editable */}
      <h2>{title}</h2>
      {renderViewModeButton(viewMode, setViewMode)}
      <div className="goal-race">Goal Race: {getLongDateString(goalDate)}</div>
      {weeks.map((week, index) =>
        Week({
          displayUnits,
          units,
          updateWorkout,
          viewMode,
          weekNumber: index + 1,
          workouts: week
        })
      )}
    </div>
  );
}

function renderViewModeButton(mode: Mode, setMode: func<Mode>) {
  // TODO: In edit mode, render "save" and "cancel" buttons
  // TODO: In view mode, render "edit" and "edit a copy" buttons
  const text = mode === "view" ? "Edit" : "Save";
  const newMode = mode === "view" ? "edit" : "view";
  const onClick = () => setMode(newMode);
  return <button onClick={onClick}>{text}</button>;
}

interface WeekProps {
  weekNumber: number;
  workouts: ScheduledWorkout[];
  units: Units;
  displayUnits: Units;
  updateWorkout: func<ScheduledWorkout>;
  viewMode: Mode;
}

function Week({
  weekNumber,
  workouts,
  units,
  displayUnits,
  updateWorkout,
  viewMode
}: WeekProps) {
  return (
    <Card key={weekNumber}>
      <h3>
        Week {weekNumber}&nbsp;&nbsp;
        <small>
          Total volume:{" "}
          {getVolumeStringFromWorkouts(workouts, units, displayUnits)}
        </small>
      </h3>
      {workouts.map(workout => (
        <Workout
          key={workout.id}
          updateWorkout={updateWorkout}
          units={units}
          displayUnits={displayUnits}
          viewMode={viewMode}
          {...workout}
        />
      ))}
    </Card>
  );
}

export interface WorkoutProps {
  id: number;
  date: Date;
  units: Units;
  displayUnits: Units;
  description: string;
  totalDistance: number;
  updateWorkout: func<ScheduledWorkout>;
  viewMode: Mode;
}

export const Workout = React.memo(function(props: WorkoutProps) {
  const {
    date,
    units,
    displayUnits,
    updateWorkout,
    id,
    description,
    totalDistance,
    viewMode
  } = props;

  const dayOfWeekString = getDayOfWeekString(date);
  const shortDateString = getShortDateString(date);
  const formattedDescription = formatWorkoutFromTemplate(
    description,
    units,
    displayUnits
  );

  const onDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTotalDistance = Number.parseFloat(e.target.value);
    updateWorkout({
      date,
      description,
      totalDistance: newTotalDistance,
      id
    });
  };

  const onDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDescription = e.target.value;
    updateWorkout({
      date,
      totalDistance,
      description: newDescription,
      id: id
    });
  };

  return (
    <div className="workout">
      <div className="date">
        {dayOfWeekString} - {shortDateString}
      </div>
      <div className="description">
        {viewMode === "edit" && (
          <>
            <div>
              Total Distance:{" "}
              <input
                value={totalDistance}
                type="number"
                onChange={onDistanceChange}
              />
            </div>
            <div>
              <input
                className={"description-input"}
                value={description}
                onChange={onDescriptionChange}
              />
            </div>
          </>
        )}
        <div>{formattedDescription}</div>
      </div>
    </div>
  );
});
