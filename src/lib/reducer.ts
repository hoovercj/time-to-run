import { Workout, Plan } from "./workout";
import { getGuid, DisplayMode } from "./utils";

export interface PlanState {
  displayMode: DisplayMode;
  plan: Plan;
  editedPlan: Plan;
  workoutToActivate?: string;
  activationReason?: { reason: ActionType };
}

export function reducer(
  state: PlanState,
  { type, payload }: Action
): PlanState {
  // TODO: deduplicate logic
  switch (type) {
    case "deleteWorkout": {
      const id = payload as string;
      const newWorkouts = [...state.editedPlan.workouts];
      const deleteIndex = newWorkouts.findIndex((w: Workout) => w.id === id);
      newWorkouts.splice(deleteIndex, 1);
      const workoutToActivate =
        newWorkouts[Math.min(deleteIndex, newWorkouts.length - 1)].id;
      return {
        ...state,
        workoutToActivate,
        activationReason: { reason: type },
        editedPlan: {
          ...state.editedPlan,
          workouts: state.editedPlan.workouts.filter((w) => w.id !== id),
        },
      };
    }
    case "insertWorkout": {
      const id = payload as string;
      const newWorkouts = [...state.editedPlan.workouts];
      let insertIndex =
        id === undefined
          ? newWorkouts.length
          : newWorkouts.findIndex((w: Workout) => w.id === id) + 1;

      const newId = getGuid();
      newWorkouts.splice(insertIndex, 0, {
        description: "",
        totalDistance: 0,
        id: newId,
      });
      return {
        ...state,
        workoutToActivate: newId,
        activationReason: { reason: type },
        editedPlan: {
          ...state.editedPlan,
          workouts: newWorkouts,
        },
      };
    }
    case "moveWorkoutUp":
    case "moveWorkoutDown": {
      const id = payload as string;
      const forward = type === "moveWorkoutDown";
      const newState = {
        ...state,
        workoutToActivate: id,
        activationReason: { reason: type },
        editedPlan: {
          ...state.editedPlan,
          workouts: [...state.editedPlan.workouts],
        },
      };

      const currentIndex = newState.editedPlan.workouts.findIndex(
        (w: Workout) => w.id === id
      );
      const nextIndex = currentIndex + (forward ? 1 : -1);

      if (nextIndex < 0 || nextIndex >= newState.editedPlan.workouts.length) {
        return state;
      }

      const workout = newState.editedPlan.workouts[currentIndex];
      const workoutToSwap = newState.editedPlan.workouts[nextIndex];

      newState.editedPlan.workouts[currentIndex] = {
        ...workoutToSwap,
      };

      newState.editedPlan.workouts[nextIndex] = {
        ...workout,
      };

      return newState;
    }
    case "setPlan": {
      const plan = payload as Plan;
      return {
        ...state,
        workoutToActivate: undefined,
        activationReason: undefined,
        plan: { ...plan },
        editedPlan: { ...plan },
      };
    }
    case "beginEdit": {
      return {
        ...state,
        workoutToActivate: undefined,
        activationReason: undefined,
        displayMode: "edit",
      };
    }
    case "endEdit": {
      const save = payload as boolean;
      const plan = save ? state.editedPlan : state.plan;
      return {
        ...state,
        workoutToActivate: undefined,
        activationReason: undefined,
        displayMode: "view",
        plan: { ...plan },
        editedPlan: { ...plan },
      };
    }
    case "updateTitle": {
      const newTitle = payload as string;
      return {
        ...state,
        workoutToActivate: undefined,
        activationReason: undefined,
        editedPlan: {
          ...state.editedPlan,
          title: newTitle,
        },
      };
    }
    case "editWorkout": {
      const newWorkout = payload as Workout;
      const newState = {
        ...state,
        workoutToActivate: undefined,
        activationReason: undefined,
        editedPlan: {
          ...state.editedPlan,
          workouts: [...state.editedPlan.workouts],
        },
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
  | "moveWorkoutDown"
  | "moveWorkoutUp"
  | "deleteWorkout"
  | "insertWorkout";

export interface Action {
  type: ActionType;
  payload?: any;
}
