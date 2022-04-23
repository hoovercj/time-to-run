import React, {
  useMemo,
  useLayoutEffect,
  useRef,
  useCallback,
  useEffect,
  useState,
} from "react";
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable'

import "./Workout.scss";

import { ISelection, saveSelection, restoreSelection } from "../lib/selection";
import { Units } from "../lib/workout";
import {
  func,
  DisplayMode,
  getDayOfWeekString,
  scrollIntoViewIfNeeded,
  getPreviousElement,
  getNextElement,
  selectText,
} from "../lib/utils";
import * as Formatter from "../lib/formatter";
import { InteractiveIcon } from "./InteractiveIcon";
import { DragHandle } from "./DragHandle";
import { Action, ActionType, InsertWorkoutPayload } from "../lib/reducer";

export interface WorkoutProps {
  id: string;
  units: Units;
  description: string;
  totalDistance: number;
  dispatch: func<Action>;
  displayMode: DisplayMode;
  date: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canDelete: boolean;
  activationReason?: { reason: ActionType };
  renderAsGrid: boolean;
}

export const Workout = React.memo(function (props: WorkoutProps) {
  const {
    dispatch,
    id,
    description,
    units,
    totalDistance,
    displayMode,
    date,
    canMoveDown,
    canMoveUp,
    canDelete,
    activationReason,
    renderAsGrid,
  } = props;

  const dateMemo = useMemo(() => new Date(date), [date]);
  const dayOfWeekString = useMemo(() => getDayOfWeekString(dateMemo), [
    dateMemo,
  ]);

  const selectionToRestore = React.useRef<ISelection | null>(null);

  const formattedHTMLValue = React.useMemo(() => {
    return Formatter.convertDescriptionToHtml(description);
  }, [description]);

  const onContentEditableChanged = React.useCallback((event: ContentEditableEvent) => {
    if (!contentEditableRef.current) {
      return;
    }

    // TODO: Should I always save the selection? Or only when something changes?
    // Or do I even need this at all?
    selectionToRestore.current = saveSelection(contentEditableRef.current)

    dispatch({
      type: "editWorkout",
      payload: {
        date,
        totalDistance,
        description: contentEditableRef.current.innerText,
        id: id,
      },
    });
  }, [date, dispatch, id, totalDistance]);

  React.useEffect(() => {
    if (!contentEditableRef.current || !selectionToRestore.current) {
      return;
    }

    restoreSelection(contentEditableRef.current, selectionToRestore.current);
    selectionToRestore.current = null;
  }, [description]);

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
    (before: boolean) => dispatch({ type: "insertWorkout", payload: {
      id,
      before,
    } as InsertWorkoutPayload}),
    [id, dispatch]
  );

  const onWorkoutKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      const isWorkoutInputPredicate = (element: HTMLElement) => element.hasAttribute("data-workoutinput");
      if (event.code === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        const target = event.currentTarget;
        if (event.shiftKey) {
          const previousInput = getPreviousElement(document.body, target, isWorkoutInputPredicate);
          if (previousInput) {
            previousInput.focus();
            selectText(previousInput);
          } else {
            onInsert(true);
          }
        } else {
          const nextInput = getNextElement(document.body, target, isWorkoutInputPredicate);
          if (nextInput) {
            nextInput.focus();
            selectText(nextInput);
          } else {
            onInsert(false);
          }
        }
      }
    },
    [onInsert]
  );

  const onContainerKeyDown = useCallback(
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
          onInsert(false);
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

  const [dragHover, setDragHover] = useState(false);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const onDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragHover(true);
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent) => {
    if (!container.current?.contains(event.relatedTarget as HTMLElement)) {
      setDragHover(false);
    }
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragHover(false);
    const dragId = event.dataTransfer.getData("id");
    console.log("dropped", id);
    dispatch({
      type: "dropWorkout",
      payload: {
        dragId: dragId,
        dropId: id,
      },
    });
  }, [dispatch, id]);

  const container = useRef<HTMLDivElement>(null);
  const moveUpButton = useRef<HTMLButtonElement>(null);
  const moveDownButton = useRef<HTMLButtonElement>(null);
  const insertButton = useRef<HTMLButtonElement>(null);
  const deleteButton = useRef<HTMLButtonElement>(null);
  const totalDistanceInputRef = useRef<HTMLInputElement>(null);
  const contentEditableRef = React.useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    // Don't change focus if this already contains it
    if (!container.current?.contains(document.activeElement)) {
      switch (activationReason?.reason) {
        case "deleteWorkout":
          deleteButton.current?.focus();
          break;
        case "insertWorkout":
          totalDistanceInputRef.current?.focus();
          totalDistanceInputRef.current?.select();
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
      if (
        document.activeElement &&
        currentContainer?.contains(document.activeElement)
      ) {
        dispatch({
          type: "notifyFocusedElementUnmounted",
          payload: document.activeElement.id,
        });
      }
    };
  }, [dispatch, container]);

  const buttonClassName = "workout-action-button";
  const iconClassName = "workout-action-icon";

  const renderActions = () =>
    displayMode === "edit" && (
      <div className="my-row edit-workout-action-container">
        <DragHandle
          id={id}
          className={`drag-button ${buttonClassName}`}
          iconClassName={iconClassName}
          draggableElement={container.current}
        />
        <InteractiveIcon
          id={`move-up-${id}`}
          onClick={() => onMove(false)}
          title="Move up (Alt+Up)"
          icon="chevronup"
          className={`move-up-button ${buttonClassName}`}
          iconClassName={iconClassName}
          disabled={!canMoveUp}
          elementRef={moveUpButton}
        />
        <InteractiveIcon
          id={`move-down-${id}`}
          onClick={() => onMove(true)}
          title="Move down (Alt+Down)"
          icon="chevrondown"
          className={`move-down-button ${buttonClassName}`}
          iconClassName={iconClassName}
          disabled={!canMoveDown}
          elementRef={moveDownButton}
        />
        <InteractiveIcon
          id={`insert-${id}`}
          onClick={() => onInsert(false)}
          title="Add new workout (Alt+N)"
          icon="plus"
          className={`insert-button ${buttonClassName}`}
          iconClassName={iconClassName}
          elementRef={insertButton}
        />
        <InteractiveIcon
          id={`delete-${id}`}
          onClick={onDelete}
          title="Delete (Alt+D)"
          icon="minus"
          className={`delete-button ${buttonClassName}`}
          iconClassName={iconClassName}
          disabled={!canDelete}
          elementRef={deleteButton}
        />
      </div>
    );

  return (
    <div
      ref={container}
      className={`workout ${displayMode} ${dragHover ? "drag-hover" : ""} ${renderAsGrid ? "grid" : ""}`}
      onKeyDown={onContainerKeyDown}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* TODO: Add an absolutely-positioned "insert workout" action here */}
      <div className="date-column">
        <div className="my-row date-string primary">
          {dayOfWeekString}
        </div>
        {renderActions()}
      </div>
      <div className="description-column">
        {displayMode === "edit" && (
          <>
            <div className="my-row total-distance-row">
              <label htmlFor={`total-distance-input-${id}`}>Total Distance:</label>
              <input
                id={`total-distance-input-${id}`}
                value={totalDistance}
                type="number"
                onChange={onDistanceChange}
                className="total-distance-input"
                data-workoutinput="true"
                onKeyDown={onWorkoutKeyDown}
                ref={totalDistanceInputRef}
              />
              <span>{units}</span>
            </div>
          </>
        )}
        <div className="my-row formatted-description-row">
          <ContentEditable
            innerRef={contentEditableRef}
            html={formattedHTMLValue}
            disabled={displayMode !== "edit"}
            onChange={onContentEditableChanged}
            data-workoutinput="true"
            onKeyDown={onWorkoutKeyDown}

          />
        </div>
      </div>
      {/* TODO: Add an absolutely-positioned "insert workout" action here */}
    </div>
  );
});
