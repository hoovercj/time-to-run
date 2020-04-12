import { Workout, Plan } from "./workout";
import { getGuid, DisplayMode } from "./utils";

export interface PlanState {
  displayMode: DisplayMode;
  plan: Plan;
  editedPlan: Plan;
}

export interface MoveWorkoutPayload {
  workout: Workout;
  forward: boolean;
}

export function reducer(state: PlanState, { type, payload }: Action): PlanState {
  // TODO: deduplicate logic
  switch (type) {
    case "deleteWorkout": {
      const id = payload as string;
      return {
        ...state,
        editedPlan: {
          ...state.editedPlan,
          workouts: state.editedPlan.workouts.filter(w => w.id !== id)
        }
      };
    }
    case "insertWorkout": {
      const id = payload as string;
      const newWorkouts = [...state.editedPlan.workouts];
      const insertIndex = newWorkouts.findIndex((w: Workout) => w.id === id);
      newWorkouts.splice(insertIndex, 0, {
        description: "",
        totalDistance: 0,
        id: getGuid()
      });
      return {
        ...state,
        editedPlan: {
          ...state.editedPlan,
          workouts: newWorkouts
        }
      };
    }
    case "moveWorkout": {
      const { workout, forward } = payload as MoveWorkoutPayload;
      const newState = {
        ...state,
        editedPlan: {
          ...state.editedPlan,
          workouts: [...state.editedPlan.workouts]
        }
      };

      const currentIndex = newState.editedPlan.workouts.findIndex(
        (w: Workout) => w.id === workout.id
      );
      const nextIndex = currentIndex + (forward ? 1 : -1);

      if (nextIndex < 0 || nextIndex >= newState.editedPlan.workouts.length) {
        return state;
      }

      const workoutToSwap = newState.editedPlan.workouts[nextIndex];

      newState.editedPlan.workouts[currentIndex] = {
        ...workoutToSwap
      };

      newState.editedPlan.workouts[nextIndex] = {
        ...workout
      };

      return newState;
    }
    case "setPlan": {
      const plan = payload as Plan;
      return {
        ...state,
        plan: { ...plan },
        editedPlan: { ...plan }
      };
    }
    case "beginEdit": {
      return {
        ...state,
        displayMode: "edit"
      };
    }
    case "endEdit": {
      const save = payload as boolean;
      const plan = save ? state.editedPlan : state.plan;
      return {
        ...state,
        displayMode: "view",
        plan: { ...plan },
        editedPlan: { ...plan }
      };
    }
    case "updateTitle": {
      const newTitle = payload as string;
      return {
        ...state,
        editedPlan: {
          ...state.editedPlan,
          title: newTitle
        }
      };
    }
    case "editWorkout": {
      const newWorkout = payload as Workout;
      const newState = {
        ...state,
        editedPlan: {
          ...state.editedPlan,
          workouts: [...state.editedPlan.workouts]
        }
      };

      const indexToUpdate = newState.editedPlan.workouts.findIndex(
        (workout: Workout) => workout.id === newWorkout.id
      );
      newState.editedPlan.workouts[indexToUpdate] = newWorkout;

      return newState;
    }
    default:
      throw new Error("Unsupported action type dispatched.");
  }
}

export type ActionType =
  | "updateTitle"
  | "editWorkout"
  | "beginEdit"
  | "endEdit"
  | "setPlan"
  | "moveWorkout"
  | "deleteWorkout"
  | "insertWorkout";

export interface Action {
  type: ActionType;
  payload?: any;
}