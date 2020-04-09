import React, { useState, useCallback, useEffect } from "react";

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
  savePlan: func<ScheduledPlan>;
}

type Mode = "edit" | "view";
const DEFAULT_VIEWMODE: Mode = "view";
const WEEK_LENGTH = 7;

export function Plan({ plan, savePlan }: PlanProps) {
  const [viewMode, setViewMode] = useState<Mode>(DEFAULT_VIEWMODE);
  const [editedPlan, setEditedPlan] = useState<ScheduledPlan>({ ...plan });
  useEffect(() => setEditedPlan(plan), [plan]);

  const toggleViewModeCallback = useCallback(() => {
    setViewMode(v => (v === "edit" ? "view" : "edit"));
  }, []);
  const editModeCallback = useCallback(
    (save: boolean) => {
      toggleViewModeCallback();
      if (save) {
        savePlan(editedPlan);
      } else {
        setEditedPlan(plan);
      }
    },
    [plan, editedPlan, savePlan, toggleViewModeCallback]
  );

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

  const renderActions = (viewMode: Mode): JSX.Element => {
    switch (viewMode) {
      case "edit":
        return renderEditModeActions(editModeCallback);
      case "view":
      default:
        return renderViewModeActions(toggleViewModeCallback);
    }
  };

  return (
    <div>
      {/* TODO: make title editable */}
      <h2>{title}</h2>
      <div className="goal-race">Goal Race: {getLongDateString(goalDate)}</div>
      {/* TODO: Make buttons nicer. possibly icons next to the plan title? */}
      <div className="actions-container">{renderActions(viewMode)}</div>
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

function renderEditModeActions(onClick: func<boolean>) {
  return (
    <>
      <button className="button primary" onClick={() => onClick(true)}>
        Save
      </button>
      <button className="button" onClick={() => onClick(false)}>
        Cancel
      </button>
    </>
  );
}

function renderViewModeActions(onClick: func<void>) {
  return (
    <button className="button" onClick={() => onClick()}>
      Edit
    </button>
  );
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
