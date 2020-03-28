import { Plan } from "./workout";

export interface UploadResult {
  plan?: Plan;
  error?: string;
}

export const importFile = (file: File): Promise<Plan> => {
  switch (file.type) {
    case "application/json":
      return importJsonFile(file);
    default:
      return Promise.reject(`Could not import file. Filetype is not supported: ${file.type}`);
  }
};

const importJsonFile = (file: File): Promise<Plan> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent) => {
      const typedEvent = event as ProgressEventExtended;
      const result =
        typedEvent && typedEvent.target && typedEvent.target.result;

      try {
        const planObject = JSON.parse(result) as Plan;
        // TODO: validate object
        resolve(planObject);
      } catch (e) {
        reject(`Unable to read ${file.name}. Check the file and try again.`);
      }
    };

    reader.readAsText(file);
  });
}

// const importCsvFile = (file: File): Promise<Plan> => {

// }

interface ProgressEventExtended extends ProgressEvent {
  target: ProgressEventTarget;
}

interface ProgressEventTarget extends EventTarget {
  result: string;
}
