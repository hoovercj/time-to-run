import { Units, Plan } from "./workout";
import { scaleNumber } from "./utils";

// Match values similar to:
// * 10.2 miles
// * 4mi
const DISTANCE_MATCH_INDEX = 1;
const WHITESPACE_MATCH_INDEX = 5;
const UNITS_MATCH_INDEX = 6;
const DESCRIPTION_REGEX = /((\d+(\.\d*)?)?|(\.\d+))(\s?)(mi|mile|miles|km|kilometer|kilometers)\b/gi;

export const convertPlanUnits = (plan: Plan, outputUnits: Units): Plan => {
    if (plan.units === outputUnits) {
        return plan;
    }

    return {
        ...plan,
        units: outputUnits,
        workouts: plan.workouts.map(({ id, totalDistance, description }) => {
          return {
            id,
            totalDistance: Math.round(scaleNumber(totalDistance, plan.units, outputUnits)),
            description: convertWorkoutDescriptionUnits(description, plan.units, outputUnits),
          };
        }),
    };
}

export const convertWorkoutDescriptionUnits = (description: string, inputUnits: Units = "miles", outputUnits: Units = inputUnits): string => {
    if (inputUnits === outputUnits) {
        return description;
    }

    const replacer = (...args: any[]): string => {
        const match = args[0];
        const distance = args[DISTANCE_MATCH_INDEX];
        const whitespace = args[WHITESPACE_MATCH_INDEX];
        const units = args[UNITS_MATCH_INDEX];
        const input = args[args.length - 1];

        if (!match) {
            return input;
        }

        const hasDistance = distance !== "";

        const convertedDistance = hasDistance ? convertDistance(distance, inputUnits, outputUnits) : "";
        const convertedUnits = inputUnits === outputUnits ? units : convertUnits(units, hasDistance ? Number.parseFloat(convertedDistance) : undefined);

        return `${convertedDistance}${whitespace}${convertedUnits}`;
    }

    return description.replace(DESCRIPTION_REGEX, replacer);
}

/**
 * Generate a styled html string from a workout description
 * @param description A workout description string such as "Run 5 miles"
 * @returns An output string such as "Run <span>5 miles</span>"
 */
 export const convertDescriptionToHtml = (description: string): string => {
    // TODO: Add a "title" attribute which says what the value is in the other unit?
    const replacer = (...args: any[]): string => {
        const match = args[0];
        const input = args[args.length - 1];

        if (!match) {
            return input;
        }

        return `<span class="highlight">${match}</span>`;
    }

    return description.replace(DESCRIPTION_REGEX, replacer);
}

const convertDistance = (input: string, inputUnits: Units, outputUnits: Units): string => {
    if (inputUnits === outputUnits) {
        return input;
    }

    // NOTE: There are a lot of edge cases around decimals that lead to erratic behavior.
    // The following code is only a best-effort attempt at allowing SOME decimal behavior.
    // Integers are preferred

    // Scale then round while preserving the number of decimal points (at most 2)
    const decimalIndex = input.lastIndexOf(".");
    const numDecimalPoints = decimalIndex >= 0
        ? Math.min(2, input.length - (1 /* for the decimal itself */ + decimalIndex))
        : 0;

    const scaledInput = scaleNumber(parseFloat(input), inputUnits, outputUnits);
    let fixedInput = scaledInput.toFixed(numDecimalPoints);
    // Only preserve a leading 0 if the input had a leading zero
    if (fixedInput.startsWith("0") && !input.startsWith("0")) {
        fixedInput = fixedInput.substring(1);
    }

    // Only preserve a trailing 0 if the input had a trailing zero
    if (fixedInput.endsWith("0") && !input.endsWith("0")) {
        fixedInput = fixedInput.substring(0, fixedInput.length - 1);
    }

    return fixedInput;
}

/**
 * Takes a distance token as an input and returns the equivalent output token in the opposite unit,
 * e.g. miles -> kilometers, or km -> mi
 * @param inputToken The match from the description [mi, mile(s), km, kilometer(s)]
 * @param outputDistance The scaled output distance
 * @returns The new output token [mi, mile(s), km, kilometer(s)]
 */
const convertUnits = (inputToken: string, outputDistance?: number): string => {
    // For short input tokens, always return the corresponding short token
    // of the opposite unit
    if (inputToken === "mi") {
        return "km";
    } else if (inputToken === "km") {
        return "mi";
    }

    // If no output distance is provided, convert the input token
    // directly to the equivalent output token, preserving plurality
    if (outputDistance == null) {
        switch (inputToken) {
            case "miles":
                return "kilometers";
            case "mile":
                return "kilometer";
            case "kilometers":
                return "miles";
            case "kilometer":
                return "mile";
            default:
                // Shouldn't happen, but for completeness:
                return inputToken;
        }
    }

    switch (inputToken) {
        case "miles":
        case "mile":
            return outputDistance === 1 ? "kilometer" : "kilometers";
        case "kilometers":
        case "kilometer":
            return outputDistance === 1 ? "mile" : "miles";
        default:
            // Shouldn't happen, but for completeness:
            return inputToken;
    }
}
