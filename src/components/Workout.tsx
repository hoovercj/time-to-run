import React, { useMemo } from "react";

import "./Workout.scss";

import { Units } from "../lib/workout";
import { func, DisplayMode, getDayOfWeekString, getShortDateString, getDistanceString } from "../lib/utils";
import { formatWorkoutFromTemplate } from "../lib/formatter";
import { IconButton } from "./IconButton";
import { Action, MoveWorkoutPayload } from "../lib/reducer";

export interface WorkoutProps {
  id: string;
  units: Units;
  displayUnits: Units;
  description: string;
  totalDistance: number;
  dispatch: func<Action>;
  displayMode: DisplayMode;
  date: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canDelete: boolean;
}

export const Workout = React.memo(function(props: WorkoutProps) {
  const {
    units,
    displayUnits,
    dispatch,
    id,
    description,
    totalDistance,
    displayMode,
    date,
    canMoveDown,
    canMoveUp,
    canDelete
  } = props;

  const dateMemo = useMemo(() => new Date(date), [date]);
  const dayOfWeekString = useMemo(() => getDayOfWeekString(dateMemo), [dateMemo]);
  const shortDateString = useMemo(() => getShortDateString(dateMemo), [dateMemo]);
  const formattedDescription = useMemo(
    () => formatWorkoutFromTemplate(description, units, displayUnits),
    [description, units, displayUnits]
  );
  const distanceString = useMemo(
    () => getDistanceString(totalDistance, units, displayUnits),
    [totalDistance, units, displayUnits]
  );

  const onDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newTotalDistance = Number.parseFloat(e.target.value);
    if (isNaN(newTotalDistance) || newTotalDistance < 0) {
      newTotalDistance = 0;
    }
    dispatch({
      type: "editWorkout",
      payload: {
        date,
        description,
        totalDistance: newTotalDistance,
        id
      }
    });
  };

  const onDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDescription = e.target.value;
    dispatch({
      type: "editWorkout",
      payload: {
        date,
        totalDistance,
        description: newDescription,
        id: id
      }
    });
  };

  const onMove = (forward: boolean) => {
    const payload: MoveWorkoutPayload = {
      forward,
      workout: {
        totalDistance,
        description,
        id
      }
    };

    dispatch({ type: "moveWorkout", payload });
  };

  const onDelete = () => dispatch({ type: "deleteWorkout", payload: id });

  const onInsert = () => dispatch({ type: "insertWorkout", payload: id });

  const buttonClassName = "workout-action-button";
  const iconClassName = "workout-action-icon";

  // TODO: Add keyboard shortcuts for actions
  const renderActions = () =>
    displayMode === "edit" && (
      <div className="my-row edit-workout-action-container">
        {/* TODO: focus is lost when moving workout between weeks */}
        <IconButton
          onClick={() => onMove(false)}
          title="Move up"
          icon="chevronup"
          buttonClassName={buttonClassName}
          iconClassName={iconClassName}
          disabled={canMoveUp}
        />
        <IconButton
          onClick={() => onMove(true)}
          title="Move down"
          icon="chevrondown"
          buttonClassName={buttonClassName}
          iconClassName={iconClassName}
          disabled={canMoveDown}
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
          disabled={canDelete}
        />
      </div>
    );

  return (
    <div className={`workout ${displayMode}`}>
      <div className="date-column">
        <div className="my-row date-string primary">
          {dayOfWeekString} - {shortDateString}
        </div>
        {renderActions()}
      </div>
      <div className="description-column">
        {displayMode === "edit" && (
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
  );
});
