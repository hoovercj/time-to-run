import React, { useCallback, useMemo } from "react";

import "./Workout.scss";

import {
  getDayOfWeekString,
  getShortDateString,
  getDistanceString,
} from "../lib/utils";
import { formatWorkoutFromTemplate } from "../lib/formatter";
import { IconButton } from "./IconButton";
import { Units, Mode } from "../lib/model";

export interface WorkoutProps {
  id: string;
  date: string;
  description: string;
  totalDistance: number;
  units: Units;
  displayUnits: Units;
  mode: Mode;
  editWorkout: (id: string, description: string, distance: number) => void;
  deleteWorkout: (id: string) => void;
  insertWorkoutAfter: (id: string) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
}

export const Workout = React.memo(function ({
  id,
  date,
  description,
  totalDistance,
  units,
  displayUnits,
  mode,
  editWorkout,
  deleteWorkout,
  insertWorkoutAfter,
  moveUp,
  moveDown,
  isFirst,
  isLast,
}: WorkoutProps) {

  console.log("Rendering workout " + id);

  const isEditMode = mode === "edit";

  const dateMemo = useMemo(() => new Date(date), [date]);
  const dayOfWeekString = useMemo(() => getDayOfWeekString(dateMemo), [
    dateMemo,
  ]);
  const shortDateString = useMemo(() => getShortDateString(dateMemo), [
    dateMemo,
  ]);

  const formattedDescription = useMemo(
    () => formatWorkoutFromTemplate(description, units, displayUnits),
    [description, units, displayUnits]
  );

  const distanceString = useMemo(() => {
    return getDistanceString(totalDistance, units, displayUnits);
  }, [totalDistance, units, displayUnits]);

  const onDistanceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let newTotalDistance = Number.parseFloat(e.target.value);
      if (isNaN(newTotalDistance) || newTotalDistance < 0) {
        newTotalDistance = 0;
      }

      editWorkout(id, description, newTotalDistance);
    },
    [id, description, editWorkout]
  );

  const onDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDescription = e.target.value || "";
      editWorkout(id, newDescription, totalDistance);
    },
    [id, totalDistance, editWorkout]
  );

  const onMoveDown = useCallback(() => moveDown(id), [id, moveDown]);

  const onMoveUp = useCallback(() => moveUp(id), [id, moveUp]);

  const onDelete = useCallback(() => deleteWorkout(id), [deleteWorkout, id]);

  const onInsert = useCallback(() => insertWorkoutAfter(id), [
    insertWorkoutAfter,
    id,
  ]);

  const buttonClassName = "workout-action-button";
  const iconClassName = "workout-action-icon";

  // TODO: Add keyboard shortcuts for actions
  const renderedActions = useMemo(
    () =>
      isEditMode && (
        <div className="my-row edit-workout-action-container">
          {/* TODO: focus is lost when moving workout between weeks */}
          <IconButton
            onClick={onMoveUp}
            title="Move up"
            icon="chevronup"
            buttonClassName={buttonClassName}
            iconClassName={iconClassName}
            disabled={isFirst}
          />
          <IconButton
            onClick={onMoveDown}
            title="Move down"
            icon="chevrondown"
            buttonClassName={buttonClassName}
            iconClassName={iconClassName}
            disabled={isLast}
          />
          {/* TODO: focus should move to the newly added item */}
          <IconButton
            onClick={onInsert}
            title="Add new workout"
            icon="plus"
            buttonClassName={buttonClassName}
            iconClassName={iconClassName}
          />
          {/* TODO: focus is lost after deleting */}
          <IconButton
            onClick={onDelete}
            title="Delete"
            icon="minus"
            buttonClassName={buttonClassName}
            iconClassName={iconClassName}
            disabled={isFirst && isLast}
          />
        </div>
      ),
    [onDelete, onInsert, onMoveUp, onMoveDown, isFirst, isLast, isEditMode]
  );

  const render = useMemo(
    () => (
      <div className={`workout ${mode}`}>
        <div className="date-column">
          <div className="my-row date-string primary">
            {dayOfWeekString} - {shortDateString}
          </div>
          {renderedActions}
        </div>
        <div className="description-column">
          {isEditMode && (
            <>
              <div className="my-row total-distance-row">
                Total Distance:
                <input
                  value={totalDistance}
                  type="number"
                  onChange={onDistanceChange}
                  className="total-distance-input"
                />
                <span>{distanceString}</span>
              </div>
              <div className="my-row description-row">
                <input
                  type="text"
                  className={"description-input"}
                  value={description}
                  onChange={onDescriptionChange}
                />
              </div>
            </>
          )}
          <div className="my-row formatted-description-row">
            {formattedDescription}
          </div>
        </div>
      </div>
    ),
    [
      isEditMode,
      dayOfWeekString,
      mode,
      shortDateString,
      formattedDescription,
      description,
      totalDistance,
      distanceString,
      renderedActions,
      onDescriptionChange,
      onDistanceChange,
    ]
  );

  return render;
});
