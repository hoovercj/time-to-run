import React, { useCallback, useState, useEffect, useMemo } from "react";

import "./Plan.scss";

import {
  getLongDateString,
  getVolumeStringFromWorkouts,
  getGuid,
} from "../lib/utils";
import { IconButton } from "./IconButton";
import { Week } from "./Week";
import { Units, Mode, Workout as IWorkout } from "../lib/model";
import { Workout } from "./Workout";

export interface PlanProps {
  id: string;
  title: string;
  units: Units;
  displayUnits: Units;
  goalDate: string;
  mode: Mode;
  workouts: IWorkout[];
  toggleEdit: () => void;
  savePlan: (planId: string, title: string, workouts: IWorkout[]) => void;
}

export function Plan({
  id,
  title,
  units,
  displayUnits,
  goalDate,
  mode,
  workouts,
  toggleEdit,
  savePlan,
}: PlanProps) {
  const [currentTitle, setCurrentTitle] = useState(title);
  useEffect(() => setCurrentTitle(title), [setCurrentTitle, title]);

  const [currentWorkouts, setCurrentWorkouts] = useState(workouts);
  useEffect(() => setCurrentWorkouts(workouts), [setCurrentWorkouts, workouts]);

  const goalDateMemo = useMemo(() => new Date(goalDate), [goalDate]);

  const savePlanCallback = useCallback(
    () => savePlan(id, currentTitle, currentWorkouts),
    [savePlan, id, currentTitle, currentWorkouts]
  );

  const moveWorkout = useCallback(
    (id: string, up: boolean) => {
      const currentIndex = currentWorkouts.findIndex((w) => w.id === id);
      if (currentIndex < 0) {
        return;
      }

      const swapIndex = currentIndex + (up ? -1 : 1);
      if (swapIndex < 0 || swapIndex >= currentWorkouts.length) {
        return;
      }

      const newWorkouts = [...currentWorkouts];
      // Funky syntax for swapping values in-place
      [newWorkouts[currentIndex], newWorkouts[swapIndex]] = [
        newWorkouts[swapIndex],
        newWorkouts[currentIndex],
      ];

      setCurrentWorkouts(newWorkouts);
    },
    [currentWorkouts, setCurrentWorkouts]
  );

  const moveUp = useCallback((id: string) => moveWorkout(id, true), [
    moveWorkout,
  ]);
  const moveDown = useCallback((id: string) => moveWorkout(id, false), [
    moveWorkout,
  ]);
  const deleteWorkout = useCallback(
    (id: string) =>
      setCurrentWorkouts(currentWorkouts.filter((w) => w.id !== id)),
    [currentWorkouts, setCurrentWorkouts]
  );
  const insertWorkoutAfter = useCallback(
    (id: string) => {
      const insertIndex = currentWorkouts.findIndex((w) => w.id === id);
      if (insertIndex < 0) {
        return;
      }

      const newWorkouts = [...currentWorkouts];
      newWorkouts.splice(insertIndex, 0, {
        id: getGuid(),
        description: "",
        totalDistance: 0,
      });

      setCurrentWorkouts(newWorkouts);
    },
    [currentWorkouts, setCurrentWorkouts]
  );

  const editWorkout = useCallback(
    (id: string, description: string, totalDistance: number) => {
      const currentIndex = currentWorkouts.findIndex((w) => w.id === id);
      if (currentIndex < 0) {
        return;
      }

      const newWorkouts = [...currentWorkouts];
      newWorkouts[currentIndex] = {
        id: newWorkouts[currentIndex].id,
        description,
        totalDistance,
      };

      setCurrentWorkouts(newWorkouts);
    },
    [currentWorkouts, setCurrentWorkouts]
  );

  const renderedWeeks: JSX.Element[] = [];
  for (
    let weekNumber = 1, tempWorkouts = [...currentWorkouts];
    tempWorkouts.length > 0;
    weekNumber++
  ) {
    const weekWorkouts = tempWorkouts.splice(0, 7);
    const volumeString = getVolumeStringFromWorkouts(
      weekWorkouts,
      units,
      displayUnits
    );
    const renderedWorkouts = weekWorkouts.map((w, indexInWeek) => {
      return (
        <Workout
          {...w}
          key={w.id}
          isFirst={weekNumber === 1 && indexInWeek === 0}
          isLast={
            tempWorkouts.length === 0 && indexInWeek === weekWorkouts.length - 1
          }
          mode={mode}
          units={units}
          displayUnits={displayUnits}
          date={goalDate}
          moveUp={moveUp}
          moveDown={moveDown}
          deleteWorkout={deleteWorkout}
          insertWorkoutAfter={insertWorkoutAfter}
          editWorkout={editWorkout}
        />
      );
    });

    renderedWeeks.push(
      <Week
        key={weekNumber}
        title={`Week ${weekNumber}`}
        subtitle={`Total volume: ${volumeString}`}
      >
        {renderedWorkouts}
      </Week>
    );
  }

  const isEditMode = mode === "edit";
  const buttonClassName = "heading-action-button";
  const iconClassName = "heading-action-icon";

  return (
    <div className={`plan ${mode}`}>
      <h2 className="plan-heading">
        {isEditMode ? (
          <input
            type="text"
            className="plan-title-input"
            onChange={(e) => setCurrentTitle(e.target.value)}
            value={currentTitle}
          />
        ) : (
          <span className="plan-title-text primary">{currentTitle}</span>
        )}
        <IconButton
          onClick={toggleEdit}
          title={isEditMode ? "Cancel" : "Edit"}
          icon={isEditMode ? "times" : "edit"}
          buttonClassName={buttonClassName}
          iconClassName={iconClassName}
        />
        {isEditMode && (
          // TODO: Focus is lost after clicking save
          <IconButton
            title="Save"
            onClick={savePlanCallback}
            icon="save"
            buttonClassName={buttonClassName}
            iconClassName={iconClassName}
          />
        )}
      </h2>
      <div className="goal-race">
        Goal Race: {getLongDateString(goalDateMemo)}
      </div>
      {renderedWeeks}
    </div>
  );
}
