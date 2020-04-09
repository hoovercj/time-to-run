import React, { useState, useContext } from "react";

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

interface WeekWorkoutUpdate {
  workout: ScheduledWorkout;
  index: number;
}

interface PlanWorkoutUpdate {
  workout: ScheduledWorkout;
  weekIndex: number;
  dayNumber: number;
}

// TODO: units are being duplicated throughout the tree
// Currently this is fine because they are always the same,
// but they could theoretically become out of sync. Normalize
// handling of units to eliminate this risk

const DEFAULT_VIEWMODE: Mode = "view";
const ViewModeContext = React.createContext<Mode>(DEFAULT_VIEWMODE);

const WEEK_LENGTH = 7;

export function Plan({ plan }: PlanProps) {
  const [viewMode, setViewMode] = useState<Mode>(DEFAULT_VIEWMODE);
  const [displayPlan, setDisplayPlan] = useState<ScheduledPlan>(plan);

  const { workouts, goalDate, title } = displayPlan;
  const weeks: ScheduledWorkout[][] = chunkArray(workouts, WEEK_LENGTH);

  const updateWorkoutInPlan: func<PlanWorkoutUpdate> = ({
    workout,
    dayNumber,
    weekIndex: weekNumber
  }) => {
    const updatedWorkouts = [...workouts];
    const updatedIndex = weekNumber * WEEK_LENGTH + dayNumber;

    updatedWorkouts[updatedIndex] = workout;

    setDisplayPlan({
      ...displayPlan,
      workouts: updatedWorkouts
    });
  };

  return (
    <ViewModeContext.Provider value={viewMode}>
      <div>
        {/* TODO: make title editable */}
        <h2>{title}</h2>
        {renderViewModeButton(viewMode, setViewMode)}
        <div className="goal-race">
          Goal Race: {getLongDateString(goalDate)}
        </div>
        {weeks.map((week, index) => {
          const updateWorkoutInWeek: func<WeekWorkoutUpdate> = ({
            workout,
            index: dayNumber
          }) => {
            updateWorkoutInPlan({ workout, dayNumber, weekIndex: index });
          };

          return (
            <Week
              key={index}
              workouts={week}
              index={index}
              displayUnits={displayPlan.displayUnits}
              updateWorkout={updateWorkoutInWeek}
            />
          );
        })}
      </div>
    </ViewModeContext.Provider>
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

export interface WeekProps {
  index: number;
  workouts: ScheduledWorkout[];
  displayUnits: Units;
  updateWorkout: func<WeekWorkoutUpdate>;
}

export function Week({
  workouts,
  index,
  displayUnits,
  updateWorkout
}: WeekProps) {
  return (
    <Card>
      <h3>
        Week {index + 1}&nbsp;&nbsp;
        <small>
          Total volume: {getVolumeStringFromWorkouts(workouts, displayUnits)}
        </small>
      </h3>
      {workouts.map((workout, index) => (
        <Workout
          key={index}
          workout={workout}
          updateWorkout={newWorkout =>
            updateWorkout({ workout: newWorkout, index })
          }
        />
      ))}
    </Card>
  );
}

export interface WorkoutProps {
  workout: ScheduledWorkout;
  updateWorkout: func<ScheduledWorkout>;
}

export function Workout({ workout, updateWorkout }: WorkoutProps) {
  const viewMode = useContext(ViewModeContext);
  const { description, date, units, displayUnits, totalDistance } = workout;

  const updateDescription = (newDescription: string) => {
    updateWorkout({
      date,
      displayUnits,
      totalDistance,
      units,
      description: newDescription
    });
  };

  const updateTotalDistance = (newTotalDistance: number) => {
    updateWorkout({
      date,
      displayUnits,
      units,
      description,
      totalDistance: newTotalDistance
    });
  };

  return (
    <div className="workout">
      <div className="date">
        {getDayOfWeekString(date)} - {getShortDateString(date)}
      </div>
      <div className="description">
        {viewMode === "edit" && (
          <>
            <div>
              Total Distance:{" "}
              <input
                value={totalDistance}
                type="number"
                onChange={e => {
                  updateTotalDistance(Number.parseFloat(e.target.value));
                }}
              />
            </div>
            <div>
              <input
                className={"description-input"}
                value={description}
                onChange={e => updateDescription(e.target.value)}
              />
            </div>
          </>
        )}
        <div>{formatWorkoutFromTemplate(description, units, displayUnits)}</div>
      </div>
    </div>
  );
}
