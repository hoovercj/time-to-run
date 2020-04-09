export type Units = "miles" | "kilometers";

export interface Plan {
  id: string;
  title: string;
  raceType: string;
  raceDistance: number;
  units: Units;
  workouts: Workout[];
}

export type ExternalPlan = Omit<Plan, "id">;

export interface Workout {
  description: string;
  totalDistance: number;
}

export interface ScheduledPlan extends Plan {
  goalDate: Date;
  workouts: ScheduledWorkout[];
  displayUnits: Units;
}

export interface ScheduledWorkout extends Workout {
  id: number;
  date: Date;
}
