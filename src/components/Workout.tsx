import React, { useMemo, useLayoutEffect, useRef, useCallback, useEffect } from "react";

import "./Workout.scss";

import { Units } from "../lib/workout";
import {
  func,
  DisplayMode,
  getDayOfWeekString,
  getShortDateString,
  getDistanceString,
  scrollIntoViewIfNeeded,
} from "../lib/utils";
import { formatWorkoutFromTemplate } from "../lib/formatter";
import { IconButton } from "./IconButton";
import { Action, ActionType } from "../lib/reducer";

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
  activationReason?: { reason: ActionType };
}

export const Workout = React.memo(function (props: WorkoutProps) {
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
    canDelete,
    activationReason,
  } = props;

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
        id,
      },
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
        id: id,
      },
    });
  };

  const onMove = useCallback(
    (forward: boolean) => {
      dispatch({
        type: forward ? "moveWorkoutDown" : "moveWorkoutUp",
        payload: id,
      });
    },
    [id, dispatch]
  );

  const onDelete = useCallback(
    () => dispatch({ type: "deleteWorkout", payload: id }),
    [id, dispatch]
  );

  const onInsert = useCallback(
    () => dispatch({ type: "insertWorkout", payload: id }),
    [id, dispatch]
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (displayMode === "edit" && event.altKey) {
        if (event.key === "d" && canDelete) {
          event.preventDefault();
          event.stopPropagation();
          onDelete();
          return;
        } else if (event.key === "n") {
          event.preventDefault();
          event.stopPropagation();
          console.log("Workout insert shortcut");
          onInsert();
          return;
        } else if (event.key === "ArrowUp" && canMoveUp) {
          event.preventDefault();
          event.stopPropagation();
          onMove(false);
          return;
        } else if (event.key === "ArrowDown" && canMoveDown) {
          event.preventDefault();
          event.stopPropagation();
          onMove(true);
          return;
        }
      }
    },
    [canDelete, canMoveDown, canMoveUp, displayMode, onDelete, onInsert, onMove]
  );

  const container = useRef<HTMLDivElement>(null);
  const descriptionInput = useRef<HTMLInputElement>(null);
  const moveUpButton = useRef<HTMLButtonElement>(null);
  const moveDownButton = useRef<HTMLButtonElement>(null);
  const insertButton = useRef<HTMLButtonElement>(null);
  const deleteButton = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    // Don't change focus if this already contains it
    if (!container.current?.contains(document.activeElement)) {
      switch (activationReason?.reason) {
        case "deleteWorkout":
          deleteButton.current?.focus();
          break;
        case "insertWorkout":
          descriptionInput.current?.focus();
          break;
        case "moveWorkoutUp":
          if (canMoveUp) {
            moveUpButton.current?.focus();
          } else if (canMoveDown) {
            moveDownButton.current?.focus();
          } else {
            // If the workout cannot be moved up or down,
            // it shouldn't have been able to activate for
            // this reason, but just in case:
            insertButton.current?.focus();
          }
          break;
        case "moveWorkoutDown":
          if (canMoveDown) {
            moveDownButton.current?.focus();
          } else if (canMoveUp) {
            moveUpButton.current?.focus();
          } else {
            // If the workout cannot be moved up or down,
            // it shouldn't have been able to activate for
            // this reason, but just in case:
            insertButton.current?.focus();
          }
          break;
        default:
          return;
      }
    }

    document.activeElement && scrollIntoViewIfNeeded(document.activeElement);
  }, [activationReason, canMoveDown, canMoveUp]);

  useEffect(() => {
    const currentContainer = container.current;

    // Cleanup function, executes on unmount or dependency change
    return () => {
      if (document.activeElement && currentContainer?.contains(document.activeElement)) {
        dispatch({ type: "notifyFocusedElementUnmounted", payload: document.activeElement.id });
      }
    }
  }, [dispatch, container]);

  const buttonClassName = "workout-action-button";
  const iconClassName = "workout-action-icon";

  const renderActions = () =>
    displayMode === "edit" && (
      <div className="my-row edit-workout-action-container">
        <IconButton
          id={`move-up-${id}`}
          onClick={() => onMove(false)}
          title="Move up (Alt+Up)"
          icon="chevronup"
          buttonClassName={buttonClassName}
          iconClassName={iconClassName}
          disabled={!canMoveUp}
          buttonRef={moveUpButton}
        />
        <IconButton
          id={`move-down-${id}`}
          onClick={() => onMove(true)}
          title="Move down (Alt+Down)"
          icon="chevrondown"
          buttonClassName={buttonClassName}
          iconClassName={iconClassName}
          disabled={!canMoveDown}
          buttonRef={moveDownButton}
        />
        <IconButton
          id={`insert-${id}`}
          onClick={onInsert}
          title="Add new workout (Alt+N)"
          icon="plus"
          buttonClassName={buttonClassName}
          iconClassName={iconClassName}
          buttonRef={insertButton}
        />
        <IconButton
          id={`delete-${id}`}
          onClick={onDelete}
          title="Delete (Alt+D)"
          icon="minus"
          buttonClassName={buttonClassName}
          iconClassName={iconClassName}
          disabled={!canDelete}
          buttonRef={deleteButton}
        />
      </div>
    );

  return (
    <div
      ref={container}
      className={`workout ${displayMode}`}
      onKeyDown={onKeyDown}
    >
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
                id={`total-distance-input-${id}`}
                value={totalDistance}
                type="number"
                onChange={onDistanceChange}
                className="total-distance-input"
              />
              <span>{distanceString}</span>
            </div>
            <div className="my-row description-row">
              <input
                id={`description-input-${id}`}
                type="text"
                className={"description-input"}
                value={description}
                onChange={onDescriptionChange}
                ref={descriptionInput}
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

(Workout as any).whyDidYouRender = {
  logOnDifferentValues: true,
  customName: 'Workout'
}