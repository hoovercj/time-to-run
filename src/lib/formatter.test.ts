import { formatWorkout } from "./formatter";
import { units } from "./workout";

describe("formatWorkout", () => {
    it("returns the input string if no placeholders found", () => {
        expect(formatWorkout("input string")).toBe("input string");
    });

    it("formats unit placeholders", () => {
        expect(formatWorkout("#D", units.miles)).toBe("miles");
        expect(formatWorkout("#D", units.kilometers)).toBe("kilometers");
        expect(formatWorkout("#d", units.miles)).toBe("mi");
        expect(formatWorkout("#d", units.kilometers)).toBe("km");
    });

    it("formats distance placeholders", () => {
        expect(formatWorkout("#123", units.miles)).toBe("123");
        expect(formatWorkout("#12.3", units.kilometers)).toBe("12.3");
        expect(formatWorkout("#5", units.kilometers, units.miles)).toBe("3");
        expect(formatWorkout("#3", units.miles, units.kilometers)).toBe("5");
    });

    it("formats distance and unit placeholders", () => {
        expect(formatWorkout("#123D", units.miles)).toBe("123 miles");
        expect(formatWorkout("#12.3d", units.kilometers)).toBe("12.3km");
    });

    it("formats placeholders with text", () => {
        expect(formatWorkout("General Aerobic: #10D and 10x100m strides")).toBe("General Aerobic: 10 miles and 10x100m strides");
    });
});