import { convertWorkoutDescription } from "./formatter";

describe("formatWorkout", () => {
    it("returns the input string if no placeholders found", () => {
        expect(convertWorkoutDescription("input string")).toBe("input string");
    });

    it("returns the input string if no output units are provided", () => {
        expect(convertWorkoutDescription("5 miles", "miles")).toBe("5 miles");
        expect(convertWorkoutDescription("5 km", "kilometers")).toBe("5 km");
        expect(convertWorkoutDescription("5mi", "miles")).toBe("5mi");
        expect(convertWorkoutDescription("kilometers", "kilometers")).toBe("kilometers");
    });

    it("converts simple distances", () => {
        expect(convertWorkoutDescription("123 miles", "miles", "kilometers")).toBe("198 kilometers");
        expect(convertWorkoutDescription("123miles", "miles", "kilometers")).toBe("198kilometers");
        expect(convertWorkoutDescription("123 mi", "miles", "kilometers")).toBe("198 km");
        expect(convertWorkoutDescription("123mi", "miles", "kilometers")).toBe("198km");
        expect(convertWorkoutDescription("198 kilometers", "kilometers", "miles")).toBe("123 miles");
        expect(convertWorkoutDescription("198kilometers", "kilometers", "miles")).toBe("123miles");
        expect(convertWorkoutDescription("198 km", "kilometers", "miles")).toBe("123 mi");
        expect(convertWorkoutDescription("198km", "kilometers", "miles")).toBe("123mi");
    });

    it("converts distances with decimals", () => {
        expect(convertWorkoutDescription("123 miles", "miles", "kilometers")).toBe("198 kilometers");
        expect(convertWorkoutDescription("12.3 miles", "miles", "kilometers")).toBe("19.8 kilometers");
        expect(convertWorkoutDescription("1.23 miles", "miles", "kilometers")).toBe("1.98 kilometers");
        expect(convertWorkoutDescription(".123 miles", "miles", "kilometers")).toBe(".20 kilometers");
        expect(convertWorkoutDescription("0.123 miles", "miles", "kilometers")).toBe("0.20 kilometers");
    });

    it("converts units without distances", () => {
        expect(convertWorkoutDescription("miles", "miles", "kilometers")).toBe("kilometers");
        expect(convertWorkoutDescription("mile", "miles", "kilometers")).toBe("kilometer");
        expect(convertWorkoutDescription("mi", "miles", "kilometers")).toBe("km");
        expect(convertWorkoutDescription("kilometers", "kilometers", "miles")).toBe("miles");
        expect(convertWorkoutDescription("kilometer", "kilometers", "miles")).toBe("mile");
        expect(convertWorkoutDescription("km", "kilometers", "miles")).toBe("mi");
    });

    it("converts multiple units with additional text and non-convertible numbers", () => {
        expect(convertWorkoutDescription("General Aerobic: 10 miles and 10x100m strides, total 11 miles", "miles", "kilometers")).toBe("General Aerobic: 16 kilometers and 10x100m strides, total 18 kilometers");
    });
});