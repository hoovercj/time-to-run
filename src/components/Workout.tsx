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
} from "../lib/utils";
// import { convertWorkoutDescription } from "../lib/formatter";
import * as Formatter from "../lib/formatter";
import { InteractiveIcon } from "./InteractiveIcon";
import { DragHandle } from "./DragHandle";
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
  renderAsGrid: boolean;
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
    renderAsGrid,
  } = props;

  const dateMemo = useMemo(() => new Date(date), [date]);
  const dayOfWeekString = useMemo(() => getDayOfWeekString(dateMemo), [
    dateMemo,
  ]);
  // const formattedDescription = useMemo(
  //   () => convertWorkoutDescription(description, units, displayUnits),
  //   [description, units, displayUnits]
  // );
  // const distanceString = useMemo(
  //   () => getDistanceString(totalDistance, units, displayUnits),
  //   [totalDistance, units, displayUnits]
  // );

  const selectionToRestore = React.useRef<ISelection | null>(null);

  const formattedHTMLValue = React.useMemo(() => {
    return Formatter.formatHtmlFromTemplate(description, units, displayUnits);
  }, [description, displayUnits, units]);

  const onContentEditableChanged = React.useCallback((event: ContentEditableEvent) => {
    if (!contentEditableRef.current) {
      return;
    }

    // TODO: Should I always save?
    selectionToRestore.current = saveSelection(contentEditableRef.current)

    const eventHtml = event.target.value;
    // const sanitizedEventHtml = eventHtml.replaceAll("&nbsp;","");
    const newHtml = Formatter.formatHtmlFromTemplate(contentEditableRef.current.innerText, units, displayUnits);

    if (newHtml !== eventHtml) {
      selectionToRestore.current = saveSelection(contentEditableRef.current);
    }

    dispatch({
      type: "editWorkout",
      payload: {
        date,
        totalDistance,
        // TODO: this will cause problems due to precision loss when converting back and forth
        description: Formatter.convertWorkoutDescription(contentEditableRef.current.innerText, displayUnits, units),
        id: id,
      },
    });
  }, [date, dispatch, displayUnits, id, totalDistance, units]);

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
  const descriptionInput = useRef<HTMLTextAreaElement>(null);
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
          onClick={onInsert}
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

  const contentEditableRef = React.useRef<HTMLElement>(null);

  return (
    <div
      ref={container}
      className={`workout ${displayMode} ${dragHover ? "drag-hover" : ""} ${renderAsGrid ? "grid" : ""}`}
      onKeyDown={onKeyDown}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
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
              />
              <span>{units}</span>
            </div>
          </>
        )}
        <div className="my-row formatted-description-row">
          {/* {formattedDescription} */}
          <ContentEditable
            innerRef={contentEditableRef}
            html={formattedHTMLValue}
            disabled={displayMode !== "edit"}
            onChange={onContentEditableChanged}
          />
        </div>
      </div>
    </div>
  );
});
