import { Units } from "./workout";
import { scaleNumber } from "./utils";

export const formatWorkoutFromTemplate = (template: string, inputUnits: Units = "miles", outputUnits: Units = inputUnits): string => {
    const replacer = (match: string, number: string, _2: string, _3: string, _4: string, units: string, offset: number, string: string): string => {
        if (!match) {
            return string;
        }

        let replacement = "";

        replacement += formatNumberTemplate(number, inputUnits, outputUnits);

        replacement += formatUnitsTemplate(units, outputUnits);

        return replacement.trim();
    }

    return template.replace(REGEX, replacer);
}

// Distance Index = 1;
// Units Index = 5;
// Regex from: https://stackoverflow.com/questions/12117024/decimal-number-regular-expression-where-digit-after-decimal-is-optional/12117060
const REGEX = /#((\d+(\.\d*)?)?|(\.\d+))?(D|d)?/g;

const LONG_UNITS: {[key in Units]: string} = {
    "kilometers": "kilometers",
    "miles": "miles",
}

const SHORT_UNITS: {[key in Units]: string} = {
    "kilometers": "km",
    "miles": "mi",
}

const formatNumberTemplate = (input: string, inputUnits: Units, outputUnits: Units): string => {
    if (!input) {
        return "";
    }

    // No need to scale or round, any decimals were intended
    if (inputUnits === outputUnits) {
        return input;
    }

    // If the units are different, scale then round
    const scaledInput = scaleNumber(parseFloat(input), inputUnits, outputUnits);
    return Math.round(scaledInput).toString(10);
}

const formatUnitsTemplate = (input: string, outputUnits: Units) => {
    if (input === "D") {
        return " " + LONG_UNITS[outputUnits];
    } else if (input === "d") {
        return SHORT_UNITS[outputUnits];
    } else {
        return "";
    }
}
