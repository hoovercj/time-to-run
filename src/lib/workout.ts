export type Units = "miles" | "kilometers";

export interface Plan {
  id: string;
  title: string;
  raceType: string;
  sourceName?: string;
  sourceUrl?: string;
  units: Units;
  workouts: Workout[];
}

export interface Workout {
  id: string;
  description: string;
  totalDistance: number;
}

export interface BuiltInPlan extends Omit<Plan, "workouts"> {
  workouts: ExternalWorkout[];
}

export interface ExternalPlan extends Omit<BuiltInPlan, "id"> {}

export type ExternalWorkout = Omit<Workout, "id">;
