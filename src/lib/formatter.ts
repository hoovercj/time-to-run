import { units } from "./workout";

export const formatWorkout = (template: string, inputUnits: units = units.miles, outputUnits: units = inputUnits): string => {
    const replacer = (match: string, number: string, _2: string, _3: string, _4: string, units: string, offset: number, string: string): string => {
        if (!match) {
            return string;
        }

        let replacement = "";

        replacement += formatNumber(number, inputUnits, outputUnits);

        replacement += formatUnits(units, outputUnits);

        return replacement.trim();
    }

    return template.replace(REGEX, replacer);
}

// Distance Index = 1;
// Units Index = 5;
// Regex from: https://stackoverflow.com/questions/12117024/decimal-number-regular-expression-where-digit-after-decimal-is-optional/12117060
const REGEX = /#((\d+(\.\d*)?)?|(\.\d+))?(D|d)?/g;

const LONG_UNITS: {[key in units]: string} = {
    "kilometers": "kilometers",
    "miles": "miles",
}

const SHORT_UNITS: {[key in units]: string} = {
    "kilometers": "km",
    "miles": "mi",
}

const getScaleFactor = (inputUnits: units, outputUnits: units): number => {
    if (inputUnits === outputUnits) {
        return 1;
    } else if (outputUnits === units.kilometers) {
        return 1.60934;
    } else {
        return 0.621371;
    }
}

const formatNumber = (input: string, inputUnits: units, outputUnits: units): string => {
    if (!input) {
        return "";
    }

    // No need to scale or round, any decimals were intended
    if (inputUnits === outputUnits) {
        return input;
    }

    // If the units are different, scale then round
    const scaledInput = parseFloat(input) * getScaleFactor(inputUnits, outputUnits);
    return Math.round(scaledInput).toString(10);
}

const formatUnits = (input: string, outputUnits: units) => {
    if (input === "D") {
        return " " + LONG_UNITS[outputUnits];
    } else if (input === "d") {
        return SHORT_UNITS[outputUnits];
    } else {
        return "";
    }
}
