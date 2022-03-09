import {
  parse as parseCsv,
  unparse as unparseCsv,
  UnparseConfig
} from "papaparse";

import { ExternalPlan, Workout, Units } from "./workout";
import { getGuid } from "./utils";

type PlanInfo = Omit<ExternalPlan, "workouts">;
type PlanHeadings = keyof PlanInfo;
type WorkoutHeadings = keyof Workout;

const PLAN_HEADINGS: PlanHeadings[] = [
  "title",
  "raceType",
  "raceDistance",
  "units"
];
const NEWLINE = "\r\n";
const COMMENT = "//";
const UNPARSE_OPTIONS: UnparseConfig = {
  header: true,
  newline: NEWLINE,
  skipEmptyLines: true
};

export const planToCsv = (plan: ExternalPlan): string => {
  const { workouts, ...planInfo } = plan;

  const planInfoData = [
    PLAN_HEADINGS,
    [planInfo.title, planInfo.raceType, planInfo.raceDistance, planInfo.units]
  ];

  const csv = [
    unparseCsv(planInfoData, UNPARSE_OPTIONS),
    NEWLINE,
    unparseCsv(workouts, UNPARSE_OPTIONS)
  ].join(NEWLINE);

  return csv;
};

export const csvToPlan = (file: string): ExternalPlan | null => {
  try {
    const result = parseCsv<string[]>(file, { skipEmptyLines: true, comments: COMMENT });
    const filteredResult = result.data.filter((line: string[]) => {
      const isCommentLine = line[0].indexOf("//") === 0;
      if (isCommentLine) {
        return false;
      }

      const isEmptyLine = line.every(value => value === "");
      if (isEmptyLine) {
        return false;
      }

      return true;
    });

    const [
      planHeadings,
      planValues,
      workoutHeadings,
      ...workouts
    ] = filteredResult as [
      PlanHeadings[],
      string[],
      WorkoutHeadings[],
      ...string[][]
    ];

    // Get column order from the file
    const titleIndex = planHeadings.indexOf("title");
    const raceTypeIndex = planHeadings.indexOf("raceType");
    const raceDistanceIndex = planHeadings.indexOf("raceDistance");
    const unitsIndex = planHeadings.indexOf("units");
    const descriptionIndex = workoutHeadings.indexOf("description");
    const workoutDistanceIndex = workoutHeadings.indexOf("totalDistance");

    // TODO: Validate values
    const plan: ExternalPlan = {
      title: planValues[titleIndex],
      raceType: planValues[raceTypeIndex],
      raceDistance: parseFloat(planValues[raceDistanceIndex]),
      units: planValues[unitsIndex] as Units,
      workouts: workouts.map(
        workout => {
          return {
            id: getGuid(),
            description: workout[descriptionIndex],
            totalDistance: parseFloat(workout[workoutDistanceIndex])
          };
        },
        [] as Workout[]
      )
    };

    return plan;
  } catch (e) {
    return null;
  }
};
