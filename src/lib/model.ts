export type Units = "miles" | "kilometers";

export type Mode = "view" | "edit";

export interface Plan {
  id: string;
  title: string;
  raceType: string;
  raceDistance: number;
  units: Units;
  workouts: Workout[];
}

export interface Workout {
  id: string;
  description: string;
  totalDistance: number;
}

export interface ExternalPlan extends Omit<Plan, "id" | "workouts"> {
  workouts: ExternalWorkout[];
}
export type ExternalWorkout = Omit<Workout, "id">;
