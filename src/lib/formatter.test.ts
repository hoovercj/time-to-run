import { convertWorkoutDescriptionUnits, convertDescriptionToHtml } from "./formatter";

describe("convertWorkoutDescriptionUnits", () => {
    it("returns the input string if no placeholders found", () => {
        expect(convertWorkoutDescriptionUnits("input string")).toBe("input string");
    });

    it("returns the input string if no output units are provided", () => {
        expect(convertWorkoutDescriptionUnits("5 miles", "miles")).toBe("5 miles");
        expect(convertWorkoutDescriptionUnits("5 km", "kilometers")).toBe("5 km");
        expect(convertWorkoutDescriptionUnits("5mi", "miles")).toBe("5mi");
        expect(convertWorkoutDescriptionUnits("kilometers", "kilometers")).toBe("kilometers");
    });

    it("converts simple distances", () => {
        expect(convertWorkoutDescriptionUnits("123 miles", "miles", "kilometers")).toBe("198 kilometers");
        expect(convertWorkoutDescriptionUnits("123miles", "miles", "kilometers")).toBe("198kilometers");
        expect(convertWorkoutDescriptionUnits("123 mi", "miles", "kilometers")).toBe("198 km");
        expect(convertWorkoutDescriptionUnits("123mi", "miles", "kilometers")).toBe("198km");
        expect(convertWorkoutDescriptionUnits("6 miles", "miles", "kilometers")).toBe("10 kilometers");
        expect(convertWorkoutDescriptionUnits("198 kilometers", "kilometers", "miles")).toBe("123 miles");
        expect(convertWorkoutDescriptionUnits("198kilometers", "kilometers", "miles")).toBe("123miles");
        expect(convertWorkoutDescriptionUnits("198 km", "kilometers", "miles")).toBe("123 mi");
        expect(convertWorkoutDescriptionUnits("198km", "kilometers", "miles")).toBe("123mi");
    });

    it("converts distances with decimals", () => {
        expect(convertWorkoutDescriptionUnits("123 miles", "miles", "kilometers")).toBe("198 kilometers");
        expect(convertWorkoutDescriptionUnits("12.3 miles", "miles", "kilometers")).toBe("19.8 kilometers");
        expect(convertWorkoutDescriptionUnits("1.23 miles", "miles", "kilometers")).toBe("1.98 kilometers");
        expect(convertWorkoutDescriptionUnits(".123 miles", "miles", "kilometers")).toBe(".2 kilometers");
        expect(convertWorkoutDescriptionUnits("0.1230 miles", "miles", "kilometers")).toBe("0.20 kilometers");
    });

    it("converts units without distances", () => {
        expect(convertWorkoutDescriptionUnits("miles", "miles", "kilometers")).toBe("kilometers");
        expect(convertWorkoutDescriptionUnits("mile", "miles", "kilometers")).toBe("kilometer");
        expect(convertWorkoutDescriptionUnits("mi", "miles", "kilometers")).toBe("km");
        expect(convertWorkoutDescriptionUnits("kilometers", "kilometers", "miles")).toBe("miles");
        expect(convertWorkoutDescriptionUnits("kilometer", "kilometers", "miles")).toBe("mile");
        expect(convertWorkoutDescriptionUnits("km", "kilometers", "miles")).toBe("mi");
    });

    it("converts multiple units with additional text and non-convertible numbers", () => {
        expect(convertWorkoutDescriptionUnits("General Aerobic: 10 miles and 10x100m strides, total 11 miles", "miles", "kilometers")).toBe("General Aerobic: 16 kilometers and 10x100m strides, total 18 kilometers");
    });
});

describe("convertDescriptionToHtml", () => {
    it("returns the input string if required placeholders aren't found", () => {
        expect(convertDescriptionToHtml("input string")).toBe("input string");
        expect(convertDescriptionToHtml("5")).toBe("5");
        expect(convertDescriptionToHtml("5 mil")).toBe("5 mil");
    });

    it("formats placeholders with text", () => {
        // TODO: better handling of whitespace for unit-only matches?
        expect(convertDescriptionToHtml("number miles")).toBe('number<span class="highlight"> miles</span>');
        expect(convertDescriptionToHtml("General Aerobic: 10 miles and 10x100m strides")).toBe('General Aerobic: <span class="highlight">10 miles</span> and 10x100m strides');
    });
});
