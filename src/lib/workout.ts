export enum Units {
    kilometers = "kilometers",
    miles = "miles",
}

export interface Plan {
    title: string;
    raceType: string;
    raceDistance: number;
    units: Units;
    workouts: Workout[];
}

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
    date: Date;
    units: Units;
    displayUnits: Units;
}