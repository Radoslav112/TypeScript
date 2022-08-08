import { StringCalculator } from "./string-calculator"

let c = new StringCalculator();

test("Test empty string handle.",()=>
{
    let res = c.summation("");

    expect(res).toBe("0");
});

test("Test summation.",()=>
{
    let res1 = c.summation("1");
    let res2 = c.summation("1.1,2.2");

    expect(res1).toBe("1");
    expect(res2).toBe((1.1+2.2).toString());
});

test("Test many numbers.",()=>
{
    let res = c.summation("10,10,10,10,10,50");

    expect(res).toBe("100");
});
 
test("Test new line separator.",()=>
{
    let res1 = c.summation("1\n2,3");
    let res2 = c.summation("175.2,\n35");

    expect(res1).toBe("6");
    expect(res2).toBe("Number expected but '\n' found at position 6.".replace(/\n/,"\\n"));
});

test("Test missing number in last position.",()=>
{
    let res = c.summation("1,3,");

    expect(res).toBe("Number expected but EOF found.");
});

test("Test custom separator.",()=>
{
    let res1 = c.summation("//;\n1;2");
    let res2 = c.summation("//|\n1|2|3");
    let res3 = c.summation("//sep\n2sep3");
    let res4 = c.summation("//|\n1|2,3");

    expect(res1).toBe("3");
    expect(res2).toBe("6");
    expect(res3).toBe("5");
    expect(res4).toBe("'|' expected but ',' found at position 3.");
});

test("Test negative numbers handle.",()=>
{
    
    let res1 = c.summation("-1,2");
    let res2 = c.summation("2,-4,-5");
    let res3 = c.summation("-1,-15,-3,-2");

    expect(res1).toBe("Negative not allowed : -1");
    expect(res2).toBe("Negative not allowed : -4, -5");
    expect(res3).toBe("Negative not allowed : -1, -15, -3, -2");
});

test("Test multiple errors handle.",()=>
{
    let res1 = c.summation("-1,,2");
    let res2 = c.summation("-1,,-2");

    expect(res1).toBe("Negative not allowed : -1\nNumber expected but ',' found at position 3.");
    expect(res2).toBe("Negative not allowed : -1\nNumber expected but ',' found at position 3.\nNegative not allowed : -2");
});