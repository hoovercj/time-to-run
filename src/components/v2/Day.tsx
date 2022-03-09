import React, { useEffect, useState } from "react"
import "./Day.scss";
import { WorkoutInput } from "./WorkoutInput";
import { WeekDay } from "./model";
import { getDayOfWeekString } from "../../lib/utils";
import { InteractiveIcon } from "../InteractiveIcon";
import { formatWorkoutFromTemplate } from "../../lib/formatter";

export interface DayProps {
  className?: string;
  content: WeekDay;
  onSave?: (workout: WeekDay) => void;
}

// TODO: Focus management
export const Day = ({ className, content, onSave }: DayProps) => {
  const { date, workout } = content;
  const dateString = getDayOfWeekString(date);

  let workoutString = workout?.description ?? "";
  let workoutDistance = workout?.totalDistance ?? 0;

  const [edit, setEdit] = useState(false);
  const [savedWorkoutString, setSavedWorkoutString] = useState(workoutString);
  const [editedWorkoutString, setEditedWorkoutString] = useState(workoutString);
  const [savedWorkoutDistance, setSavedWorkoutDistance] = useState(Number(workoutDistance));
  const [editedWorkoutDistance, setEditedWorkoutDistance] = useState(Number(workoutDistance));

  const editable = !!onSave && !!workout;

  useEffect(() => {
    setSavedWorkoutString(workoutString);
  }, [workoutString])

  useEffect(() => {
    setSavedWorkoutDistance(Number(workoutDistance));
  }, [workoutDistance])

  const onSaveCallback = () => {
    // setSavedWorkoutString is called to allow Workout to function as a standalone component,
    // though it is likely that the wrapping component will pass in an updated workoutString prop as well.
    setSavedWorkoutString(editedWorkoutString);
    setSavedWorkoutDistance(editedWorkoutDistance);
    if (workout) {
      onSave?.({
        date,
        workout: {
          totalDistance: editedWorkoutDistance,
          description: editedWorkoutString,
        }
      });
    }
    setEdit(false);
  };

  const onCancelCallback = () => {
    setEditedWorkoutString(savedWorkoutString);
    setEditedWorkoutDistance(savedWorkoutDistance);
    setEdit(false);
  }

  const renderHeaderActions = () => {
    // TODO: Add Options: Copy workout, Delete, New Before/After ?
    // <button onClick={onOptionsCallback}>Options</button> */}
    return editable && !edit && <InteractiveIcon title="Edit" icon="edit" onClick={()=>setEdit(true)}/>;
  }

  const renderEditActions = () => {
    return editable && edit && <>
      <InteractiveIcon title="Save" icon="save" onClick={onSaveCallback}/>
      <InteractiveIcon title="Cancel" icon="times" onClick={onCancelCallback}/>
    </>;
  }

  return (
    <div className={`workout-container ${className ?? ""}`}>
      <div className="workout-header-container">
        <span className="workout-header-date primary">{dateString}</span>
        {renderHeaderActions()}
      </div>
      <div className="workout-body-container">
        {editable && edit
          ? <>
              {/*
                  TODO: Fix highlights. They don't work in narrow screens,
                  but they DO work in the demo app https://react-mentions.vercel.app/
              */}
              <WorkoutInput
                initialWorkoutString={savedWorkoutString}
                onWorkoutStringChanged={setEditedWorkoutString}
              />
              <div className="total-distance-container">
                <label htmlFor="total-distance-input">Total miles:</label>
                <input type="number" id="total-distance-input" value={editedWorkoutDistance} onChange={(e) => setEditedWorkoutDistance(e.target.value)}/>
              </div>
              {renderEditActions()}
            </>
          : <div>{formatWorkoutFromTemplate(savedWorkoutString)}</div>}
      </div>
    </div>
  );
}
