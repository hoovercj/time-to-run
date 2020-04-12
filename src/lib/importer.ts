import { ExternalPlan } from "./model";
import { getFileExtension } from "./utils";
import { csvToPlan } from "./csvProcessor";

export interface UploadResult {
  plan?: ExternalPlan;
  error?: string;
}

type FileProcessor = (file: string) => ExternalPlan | null;

export const importFile = (file: File): Promise<ExternalPlan> => {
  const extension = getFileExtension(file.name);
  switch (extension) {
    case ".json":
      return importCore(file, processJsonFile);
    case ".csv":
      return importCore(file, csvToPlan);
    default:
      return Promise.reject(
        `Could not import file. Filetype is not supported: ${extension}`
      );
  }
};

const importCore = (file: File, processFile: FileProcessor): Promise<ExternalPlan> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent) => {
      const typedEvent = event as ProgressEventExtended;
      const result =
        typedEvent && typedEvent.target && typedEvent.target.result;

      const plan = processFile(result);

      if (plan) {
        resolve(plan);
      } else {
        reject(`Unable to read ${file.name}. Check the file and try again.`);
      }
    };

    reader.readAsText(file);
  });
};

const processJsonFile = (file: string): ExternalPlan | null => {
  try {
    const planObject = JSON.parse(file) as ExternalPlan;
    // TODO: validate object
    return planObject;
  } catch (e) {
    return null;
  }
};

interface ProgressEventExtended extends ProgressEvent {
  target: ProgressEventTarget;
}

interface ProgressEventTarget extends EventTarget {
  result: string;
}
