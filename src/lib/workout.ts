export enum units {
    kilometers = "kilometers",
    miles = "miles",
}

export interface Plan {
    title: string;
    raceType: string;
    raceDistance: number;
    units: units;
    workouts: Workout[];
}

export interface Workout {
    description: string;
    totalDistance: number;
}

export interface ScheduledPlan extends Plan {
    goalDate: Date;
    workouts: ScheduledWorkout[];
}

export interface ScheduledWorkout extends Workout {
    date: Date;
}