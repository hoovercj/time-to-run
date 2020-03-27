import { formatWorkoutFromTemplate } from "./formatter";
import { Units } from "./workout";

describe("formatWorkout", () => {
    it("returns the input string if no placeholders found", () => {
        expect(formatWorkoutFromTemplate("input string")).toBe("input string");
    });

    it("formats unit placeholders", () => {
        expect(formatWorkoutFromTemplate("#D", "miles")).toBe("miles");
        expect(formatWorkoutFromTemplate("#D", "kilometers")).toBe("kilometers");
        expect(formatWorkoutFromTemplate("#d", "miles")).toBe("mi");
        expect(formatWorkoutFromTemplate("#d", "kilometers")).toBe("km");
    });

    it("formats distance placeholders", () => {
        expect(formatWorkoutFromTemplate("#123", "miles")).toBe("123");
        expect(formatWorkoutFromTemplate("#12.3", "kilometers")).toBe("12.3");
        expect(formatWorkoutFromTemplate("#5", "kilometers", "miles")).toBe("3");
        expect(formatWorkoutFromTemplate("#3", "miles", "kilometers")).toBe("5");
    });

    it("formats distance and unit placeholders", () => {
        expect(formatWorkoutFromTemplate("#123D", "miles")).toBe("123 miles");
        expect(formatWorkoutFromTemplate("#12.3d", "kilometers")).toBe("12.3km");
    });

    it("formats placeholders with text", () => {
        expect(formatWorkoutFromTemplate("General Aerobic: #10D and 10x100m strides")).toBe("General Aerobic: 10 miles and 10x100m strides");
    });
});