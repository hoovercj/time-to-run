import { Plan, Workout, Units } from "./workout";
import { parse as parseCsv } from "papaparse";
import { getFileExtension } from "./utils";

export interface UploadResult {
  plan?: Plan;
  error?: string;
}

type FileProcessor = (file: string) => Promise<Plan>;

export const importFile = (file: File): Promise<Plan> => {
  const extension = getFileExtension(file.name);
  switch (extension) {
    case ".json":
      return importCore(file, processJsonFile);
    case ".csv":
      return importCore(file, processCsvFile);
    default:
      return Promise.reject(
        `Could not import file. Filetype is not supported: ${extension}`
      );
  }
};

const importCore = (file: File, processFile: FileProcessor): Promise<Plan> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent) => {
      const typedEvent = event as ProgressEventExtended;
      const result =
        typedEvent && typedEvent.target && typedEvent.target.result;

      try {
        resolve(processFile(result));
      } catch (e) {
        reject(`Unable to read ${file.name}. Check the file and try again.`);
      }
    };

    reader.readAsText(file);
  });
};

const processJsonFile = (file: string): Promise<Plan> => {
  try {
    const planObject = JSON.parse(file) as Plan;
    // TODO: validate object
    return Promise.resolve(planObject);
  } catch (e) {
    return Promise.reject(
      `Unable to read the json file. Check the file and try again.`
    );
  }
};

type PlanHeadings = keyof Plan;
type WorkoutHeadings = keyof Workout;
type WorkoutValue = [string, string];

const processCsvFile = (file: string): Promise<Plan> => {
  try {
    const result = parseCsv(file);
    const [
      planHeadings,
      planValues,
      workoutHeadings,
      ...workouts
    ] = result.data as [
      PlanHeadings[],
      string[],
      WorkoutHeadings[],
      ...string[][]
    ];

    const titleIndex = planHeadings.indexOf("title");
    const raceTypeIndex = planHeadings.indexOf("raceType");
    const raceDistanceIndex = planHeadings.indexOf("raceDistance");
    const unitsIndex = planHeadings.indexOf("units");

    const descriptionIndex = workoutHeadings.indexOf("description");
    const workoutDistanceIndex = workoutHeadings.indexOf("totalDistance");

    // TODO: Validate values
    const plan: Plan = {
      // Add some resiliency for the header in case these are in a different order
      title: planValues[titleIndex],
      raceType: planValues[raceTypeIndex],
      raceDistance: parseFloat(planValues[raceDistanceIndex]),
      units: planValues[unitsIndex] as Units,
      workouts: workouts.reduce(
        (output, workout) => {
          if (workout.length === 2) {
            output.push({
              description: workout[descriptionIndex],
              totalDistance: parseFloat(workout[workoutDistanceIndex])
            });
          }

          return output;
        },
        [] as Workout[]
      )
    };

    return Promise.resolve(plan);
  } catch (e) {
    return Promise.reject(
      `Unable to read the csv file. Check the file and try again.`
    );
  }
};

interface ProgressEventExtended extends ProgressEvent {
  target: ProgressEventTarget;
}

interface ProgressEventTarget extends EventTarget {
  result: string;
}
