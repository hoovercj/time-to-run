import { Units } from "./workout";
import { scaleNumber } from "./utils";

// Match values similar to:
// * 10.2 miles
// * 4mi
const DISTANCE_MATCH_INDEX = 1;
const WHITESPACE_MATCH_INDEX = 5;
const UNITS_MATCH_INDEX = 6;
const DESCRIPTION_REGEX = /((\d+(\.\d*)?)?|(\.\d+))(\s?)(mi|mile|miles|km|kilometer|kilometers)\b/gi;

export const convertWorkoutDescription = (description: string, inputUnits: Units = "miles", outputUnits: Units = inputUnits, wrapper?: (match: string) => string): string => {
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
        const convertedUnits = convertUnits(units, hasDistance ? Number.parseFloat(convertedDistance) : undefined);

        const replacement = `${convertedDistance}${whitespace}${convertedUnits}`;
        return wrapper ? wrapper(replacement) : replacement;
    }

    return description.replace(DESCRIPTION_REGEX, replacer);
}

/**
 * Generate a styled html string from a template string
 * @param template A template string such as "Run #5_D (5 x #1d)"
 * @param inputUnits The units used in the input, i.e. #1d represents 1 mile or 1 km depending on the input unit
 * @param outputUnits The units for the output, i.e. #3.1d -> 5 km if the input unit is miles and the output is kilometers
 * @returns An output string such as "Run <span>5 miles</span> (1 x <span>1mi</span>)"
 */
 export const formatHtmlFromTemplate = (template: string, inputUnits: Units = "miles", outputUnits: Units = inputUnits): string => {
    return formatWorkoutFromTemplate(template, inputUnits, outputUnits, (match) => `<span style="text-decoration: underline">${match}</span>`);
}

const convertDistance = (input: string, inputUnits: Units, outputUnits: Units): string => {
    // NOTE: There are a lot of edge cases around decimals that lead to erratic behavior.
    // The following code is only a best-effort attempt at allowing SOME decimal behavior.
    // Integers are preferred

    // Scale then round while preserving the number of decimal points (at most 2)
    const decimalIndex = input.lastIndexOf(".");
    const numDecimalPoints = decimalIndex >= 0
        ? Math.min(2, input.length - (1 /* for the decimal itself */ + decimalIndex))
        : 0;

    const scaledInput = scaleNumber(parseFloat(input), inputUnits, outputUnits);
    const fixedInput = scaledInput.toFixed(numDecimalPoints);
    return fixedInput.startsWith("0") && !input.startsWith("0")
        ? fixedInput.substring(1)
        : fixedInput;
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
