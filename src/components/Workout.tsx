import React, { useCallback, useMemo } from "react";

import "./Workout.scss";

import {
  getDayOfWeekString,
  getShortDateString,
  getDistanceString
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

export const Workout = function(props: WorkoutProps) {
  const isEditMode = props.mode === "edit";

  const date = useMemo(() => new Date(props.date), [props.date]);
  const dayOfWeekString = useMemo(() => getDayOfWeekString(date), [date]);
  const shortDateString = useMemo(() => getShortDateString(date), [date]);

  const formattedDescription = useMemo(
    () =>
      formatWorkoutFromTemplate(
        props.description,
        props.units,
        props.displayUnits
      ),
    [props.description, props.units, props.displayUnits]
  );

  const distanceString = useMemo(() => {
    return getDistanceString(props.totalDistance, props.units, props.displayUnits);
  }, [props.totalDistance, props.units, props.displayUnits]);

  const onDistanceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let newTotalDistance = Number.parseFloat(e.target.value);
      if (isNaN(newTotalDistance) || newTotalDistance < 0) {
        newTotalDistance = 0;
      }

      props.editWorkout(props.id, props.description, newTotalDistance);
    },
    [props.id, props.description, props.editWorkout]
  );

  const onDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDescription = e.target.value || "";
      props.editWorkout(props.id, newDescription, props.totalDistance);
    },
    [props.id, props.totalDistance, props.editWorkout]
  );

  const onMoveDown = useCallback(() => props.moveDown(props.id), [
    props.id,
    props.moveDown
  ]);

  const onMoveUp = useCallback(() => props.moveUp(props.id), [
    props.id,
    props.moveUp
  ]);

  const onDelete = useCallback(() => props.deleteWorkout(props.id), [
    props.deleteWorkout,
    props.id
  ]);

  const onInsert = useCallback(() => props.insertWorkoutAfter(props.id), [
    props.insertWorkoutAfter,
    props.id
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
            disabled={props.isFirst}
          />
          <IconButton
            onClick={onMoveDown}
            title="Move down"
            icon="chevrondown"
            buttonClassName={buttonClassName}
            iconClassName={iconClassName}
            disabled={props.isLast}
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
            disabled={props.isFirst && props.isLast}
          />
        </div>
      ),
    [
      onDelete,
      onInsert,
      onMoveUp,
      onMoveDown,
      props.isFirst,
      props.isLast,
      isEditMode
    ]
  );

  const render = useMemo(
    () => (
      <div className={`workout ${props.mode}`}>
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
                  value={props.totalDistance}
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
                  value={props.description}
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
      props.mode,
      shortDateString,
      formattedDescription,
      props.description,
      props.totalDistance,
      distanceString,
      renderedActions,
      onDescriptionChange,
      onDistanceChange,
    ]
  );

  return render;
};
