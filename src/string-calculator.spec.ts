import { StringCalculator } from "./string-calculator"

let c;

beforeEach(() => {
    c = new StringCalculator();
});

describe('Summation correct input', () => {
    it("Summation.", () => {
        let res1 = c.summation("1");
        let res2 = c.summation("1.1,2.2");

        expect(res1).toBe("1");
        expect(res2).toBe((1.1 + 2.2).toString());
    });

    it("Summate many numbers.", () => {
        let res = c.summation("10,10,10,10,10,50");

        expect(res).toBe("100");
    });
});

describe('Empty input handle', () => {
    test("Test empty string handle.", () => {
        let res = c.summation("");

        expect(res).toBe("0");
    });
});

describe('New line separator', () => {
    it('Handle correct input', () => {
        let res = c.summation("1\n2,3");

        expect(res).toBe("6");
    });
    it('Handle incorrect input', () => {
        let res = c.summation("175.2,\n35");

        expect(res).toBe("Number expected but '\n' found at position 6.".replace(/\n/, "\\n"));
    });
});

describe('Missing number in last position.', () => {
    it('Should handle missed number on last position', () => {
        let res = c.summation("1,3,");

        expect(res).toBe("Number expected but EOF found.");
    });
});

describe('Custom separator.', () => {
    it('Handle correct input.', () => {
        let res1 = c.summation("//;\n1;2");
        let res2 = c.summation("//|\n1|2|3");
        let res3 = c.summation("//sep\n2sep3");

        expect(res1).toBe("3");
        expect(res2).toBe("6");
        expect(res3).toBe("5");
    });

    it('Handle incorrect input.', () => {
        let res = c.summation("//|\n1|2,3");

        expect(res).toBe("'|' expected but ',' found at position 3.");
    })
});

describe('Negative numbers.', () => {
    it('Handle incorrect input.', () => {
        let res1 = c.summation("-1,2");
        let res2 = c.summation("2,-4,-5");
        let res3 = c.summation("-1,-15,-3,-2");

        expect(res1).toBe("Negative not allowed : -1");
        expect(res2).toBe("Negative not allowed : -4, -5");
        expect(res3).toBe("Negative not allowed : -1, -15, -3, -2");
    })
})

describe("Test multiple errors handle.", () => {
    it("handles multiple errors.", () => {
        let res1 = c.summation("-1,,2");
        let res2 = c.summation("-1,,-2");

        expect(res1).toBe("Negative not allowed : -1\nNumber expected but ',' found at position 3.");
        expect(res2).toBe("Negative not allowed : -1\nNumber expected but ',' found at position 3.\nNegative not allowed : -2");
    })
});