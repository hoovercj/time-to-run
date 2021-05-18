export type Units = "miles" | "kilometers";

export interface Workout {
  // id: string;
  description: string;
  totalDistance: number;
  // units: Units;
}

// export type WeekDays = Array<WeekDay>;
export type WeekDays = [WeekDay, WeekDay, WeekDay, WeekDay, WeekDay, WeekDay, WeekDay];

export interface WeekDay {
  date: Date;
  workout?: Workout;
}
