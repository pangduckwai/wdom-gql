test("Test validity - String array index inbound", () => {
    let src = ["hello", "there", "how", "are", "you"];
    expect(src[0]).toBe("hello");
});

test("Test validity - String array index out of bound", () => {
    let src = ["hello", "there", "how", "are", "you"];
    expect(src[5]).toBeUndefined();
});

test("Test validity - String array index out of bound", () => {
    let src = ["hello", "there", "how", "are", "you"];
    expect(src[5]).toBeFalsy();
});

test("Test validity - Int array element value equals zero", () => {
    let src = [1, 2, 0, 3, 4];
    expect(src[2]).toBeFalsy(); //NOTE!!!! zero value is 'false'!!!!
});

test("Test validity - Int array index out of bound", () => {
    let src = [1, 2, 0, 3, 4];
    expect(src[5]).toBeFalsy(); //NOTE!!!! same result as the previous test!!!
});

test("Test validity - Int array index out of bound properly tested", () => {
    let src = [1, 2, 0, 3, 4];
    // expect(src[2]).toBeUndefined(); This will FAILED because zero value is not undefined!!!
    expect(src[5]).toBeUndefined();
});

test("Test validity - Object", () => {
    let src = {
        "hello": 1,
        "there": 0,
        "how"  : 2,
        "are"  : 3,
        "you"  : 7
    };
    expect(src.there).toBeFalsy(); //NOTE!!!! zero value is 'false'!!!!
});

test("Test validity - Object", () => {
    let src = {
        "hello": 1,
        "there": 0,
        "how"  : 2,
        "are"  : 3,
        "you"  : 7
    };
    expect(src.today).toBeFalsy(); //NOTE!!!! same result as the previous test!!!
});

test("Test validity - Undefined object property", () => {
    let src = {
        "hello": 1,
        "there": 0,
        "how"  : 2,
        "are"  : 3,
        "you"  : 7
    };
    // expect(src.there).toBeUndefined(); This will FAILED because zero value is not undefined!!!
    expect(src.today).toBeUndefined();
});

test("Test validity - Object of object", () => {
    let src = {
        "hello": { value: 1 },
        "there": { value: 0 },
        "how"  : { value: 2 },
        "are"  : { value: 3 },
        "you"  : { value: 7 }
    };
    expect(src.today).toBeFalsy();
});

test("Test validity - Object of object", () => {
    let src = {
        "hello": { value: 1 },
        "there": { value: 0 },
        "how"  : { value: 2 },
        "are"  : { value: 3 },
        "you"  : { value: 7 }
    };
    expect(src.there.value).toBe(0);
});
