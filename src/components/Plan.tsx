import React, {
  useCallback,
  useReducer,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";

import "./Plan.scss";

import { Plan as IPlan, Units } from "../lib/workout";
import {
  func,
  getLongDateString,
  DisplayMode,
  DEFAULT_DISPLAYMODE,
  getVolumeStringFromWorkouts,
  addDays,
  getVolumeFromWorkouts,
} from "../lib/utils";

import { IconButton } from "./IconButton";
import { reducer, Action } from "../lib/reducer";
import { Week } from "./Week";
import { Workout } from "./Workout";

export interface PlanProps {
  plan: IPlan;
  goalDate: Date;
  savePlan: func<IPlan>;
  displayUnits: Units;
  onDisplayModeChanged?: func<DisplayMode>;
}

const WEEK_LENGTH = 7;

export function Plan({
  plan,
  savePlan,
  goalDate,
  displayUnits,
  onDisplayModeChanged,
}: PlanProps) {
  const [state, dispatch] = useReducer(reducer, {
    displayMode: DEFAULT_DISPLAYMODE,
    plan: plan,
    editedPlan: plan,
  });

  // Properties that aren't editable
  const { units } = plan;
  // Properties that are editable
  const { displayMode, editedPlan, focusedElement } = state;

  const editCancelButton = useRef<HTMLButtonElement>(null);
  const workoutsContainer = useRef<HTMLDivElement>(null);
  const { title, workouts } = editedPlan;
  const isEditMode = displayMode === "edit";

  useEffect(() => onDisplayModeChanged && onDisplayModeChanged(displayMode), [
    displayMode,
    onDisplayModeChanged,
  ]);

  useEffect(() => {
    dispatch({ type: "setPlan", payload: plan });
  }, [plan]);

  useLayoutEffect(() => {
    if (focusedElement) {
      console.log("Focused element unmounted, re-setting focus");
      document.getElementById(focusedElement.elementId)?.focus();
    }
  }, [focusedElement]);

  const toggleEdit = useCallback(() => {
    // If the focus is on some element before the save and
    // the focus is lost during the save, set the focus somewhere
    // predictable.
    if (document.activeElement !== document.body) {
      setTimeout(() => {
        if (document.activeElement === document.body) {
          editCancelButton.current?.focus();
        }
      }, 0);
    }
    const action: Action = isEditMode
      ? { type: "endEdit", payload: false }
      : { type: "beginEdit" };

    dispatch(action);
  }, [isEditMode, dispatch]);

  const performSave = useCallback(() => {
    // If the focus is on some element before the save and
    // the focus is lost during the save, set the focus somewhere
    // predictable.
    if (document.activeElement !== document.body) {
      setTimeout(() => {
        if (document.activeElement === document.body) {
          editCancelButton.current?.focus();
        }
      }, 0);
    }

    savePlan(editedPlan);
    dispatch({ type: "endEdit", payload: true });
  }, [savePlan, editedPlan]);

  useEffect(() => {
    const eventListener = (event: KeyboardEvent) => {
      // The primary key is alt+s, but users will probably type
      // ctrl+s, so both are captured here
      if (event.key === "s" && (event.altKey || event.ctrlKey)) {
        // PreventDefault even if the page isn't in edit mode
        // to avoid a situation where the shortcut sometimes saves
        // and sometimes opens the system "Save" dialog
        event.preventDefault();
        event.stopPropagation();
        if (isEditMode) {
          performSave();
        }

        return;
      }

      if (event.altKey) {
        if (event.key === "e") {
          event.preventDefault();
          event.stopPropagation();
          toggleEdit();
          return;
        }

        if (event.key === "n" && isEditMode) {
          // Listeners added by "addEventListener" don't play well with listeners
          // added directly to react components, so stopPropagation called by
          // listeners in the workoutsContainer will not prevent the event from
          // reaching the document body, therefore it is necessary to manually
          // check whether that event will be triggered or not.
          // This could be avoided by adding this "global" listener to a root react component,
          // but then I would need to lift the state to that component or provide
          // an interface for that component to communicate the keyboard events to this component.
          if (workoutsContainer.current?.contains(document.activeElement)) {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          dispatch({ type: "insertWorkout", payload: undefined });
          return;
        }
      }
    };

    document.body.addEventListener("keydown", eventListener);

    return () => {
      document.body.removeEventListener("keydown", eventListener);
    };
  }, [dispatch, performSave, toggleEdit, isEditMode]);

  let renderedWeeks: JSX.Element[] = [];
  for (
    let weekNumber = 1, tempWorkouts = [...workouts];
    tempWorkouts.length > 0;
    weekNumber++
  ) {
    const weekWorkouts = tempWorkouts.splice(0, WEEK_LENGTH);

    const volume = getVolumeFromWorkouts(workouts, units, displayUnits);

    const weekTitle = `Week ${weekNumber}`;
    let weekSubtitle = undefined;

    if (volume > 0) {
      const volumeString = getVolumeStringFromWorkouts(weekWorkouts, units, displayUnits);
      weekSubtitle = `Total Volume: ${volumeString}`;
    }

    const renderedWorkouts = weekWorkouts.map((w, indexInWeek) => {
      const isFirst = weekNumber === 1 && indexInWeek === 0;
      const isLast =
        tempWorkouts.length === 0 && indexInWeek === weekWorkouts.length - 1;
      const isOnly = isFirst && isLast;
      const daysToGoal =
        tempWorkouts.length + (weekWorkouts.length - indexInWeek) - 1;
      const date = addDays(goalDate, daysToGoal * -1);
      return (
        <Workout
          {...w}
          key={w.id}
          dispatch={dispatch}
          units={units}
          displayUnits={displayUnits}
          displayMode={displayMode}
          canDelete={!isOnly}
          canMoveUp={!isFirst}
          canMoveDown={!isLast}
          date={date.toDateString()}
          activationReason={
            state.workoutToActivate === w.id
              ? state.activationReason
              : undefined
          }
        />
      );
    });

    renderedWeeks.push(
      <Week
        key={weekNumber}
        title={weekTitle}
        subtitle={weekSubtitle}
      >
        {renderedWorkouts}
      </Week>
    );
  }

  return (
    <div className={`plan ${displayMode}`}>
      <h2 className="plan-heading">
        {renderTitle(title, dispatch, isEditMode)}
        {renderActions(isEditMode, toggleEdit, performSave, editCancelButton)}
      </h2>
      <div className="goal-race">Goal Race: {getLongDateString(goalDate)}</div>
      <div ref={workoutsContainer}>{renderedWeeks}</div>
    </div>
  );
}

function renderTitle(
  title: string,
  dispatch: func<Action>,
  isEditMode: boolean
): JSX.Element | string {
  return isEditMode ? (
    <input
      type="text"
      className="plan-title-input"
      onChange={(e) =>
        dispatch({ type: "updateTitle", payload: e.target.value })
      }
      value={title}
    />
  ) : (
    <span className="plan-title-text primary">{title}</span>
  );
}

function renderActions(
  isEditMode: boolean,
  toggleEdit: func<void>,
  saveEdit: func<void>,
  toggleEditButton: React.RefObject<HTMLButtonElement>
) {
  const buttonClassName = "heading-action-button";
  const iconClassName = "heading-action-icon";

  return (
    <>
      <IconButton
        onClick={toggleEdit}
        title={`${isEditMode ? "Cancel" : "Edit"} (Alt+E)`}
        icon={isEditMode ? "times" : "edit"}
        buttonClassName={buttonClassName}
        iconClassName={iconClassName}
        buttonRef={toggleEditButton}
      />
      {isEditMode && (
        <IconButton
          title="Save (Alt+S)"
          onClick={() => {
            saveEdit();
            toggleEditButton.current?.focus();
          }}
          icon="save"
          buttonClassName={buttonClassName}
          iconClassName={iconClassName}
        />
      )}
    </>
  );
}
