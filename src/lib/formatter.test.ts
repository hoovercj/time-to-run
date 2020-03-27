import { formatWorkout } from "./formatter";
import { Units } from "./workout";

describe("formatWorkout", () => {
    it("returns the input string if no placeholders found", () => {
        expect(formatWorkout("input string")).toBe("input string");
    });

    it("formats unit placeholders", () => {
        expect(formatWorkout("#D", Units.miles)).toBe("miles");
        expect(formatWorkout("#D", Units.kilometers)).toBe("kilometers");
        expect(formatWorkout("#d", Units.miles)).toBe("mi");
        expect(formatWorkout("#d", Units.kilometers)).toBe("km");
    });

    it("formats distance placeholders", () => {
        expect(formatWorkout("#123", Units.miles)).toBe("123");
        expect(formatWorkout("#12.3", Units.kilometers)).toBe("12.3");
        expect(formatWorkout("#5", Units.kilometers, Units.miles)).toBe("3");
        expect(formatWorkout("#3", Units.miles, Units.kilometers)).toBe("5");
    });

    it("formats distance and unit placeholders", () => {
        expect(formatWorkout("#123D", Units.miles)).toBe("123 miles");
        expect(formatWorkout("#12.3d", Units.kilometers)).toBe("12.3km");
    });

    it("formats placeholders with text", () => {
        expect(formatWorkout("General Aerobic: #10D and 10x100m strides")).toBe("General Aerobic: 10 miles and 10x100m strides");
    });
});