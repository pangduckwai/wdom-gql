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

let dest = ({ id, name, value, detail = { v1: -1, v2: -1, v3: -1 }, flag }) => {
	let ret = 0;
	let msg = [];
	if (typeof(id) !== "undefined") {
		ret ++;
		msg.push(`ID:'${id}';`);
	} else
		msg.push("ID not specified;");

	if (typeof(name) !== "undefined" && name !== null) {
		ret ++;
		msg.push(`Name:'${name}';`);
	} else
		msg.push("Name not specified;");

	if (typeof(value) !== "undefined") {
		ret ++;
		msg.push(`Value:'${value}';`);
	} else
		msg.push("Value not given;");

	if ((detail.v1 < 0) && (detail.v2 < 0) && (detail.v3 < 0)) {
		msg.push("Detail not provided;");
	} else {
		ret ++;
		msg.push(`Detail:'${detail.v1}.${detail.v2}.${detail.v3}';`);
	}

	if (flag) {
		ret ++;
		msg.push("Flag:YES;");
	} else {
		msg.push("Flag:NO;");
	}

	console.log(...msg);
	return ret;
}

test("Destructuring 1", () => {
	expect(dest({
		id: "999",
		name: "Hello",
		value: 689
	})).toBe(3);
});

test("Destructuring 2", () => {
	expect(dest({
		name: "Hello",
		value: 7689,
		status: "yes"
	})).toBe(2);
});

test("Destructuring 3", () => {
	expect(dest({
		id: "007"
	})).toBe(1);
});

test("Destructuring 4", () => {
	expect(dest({
		id: "008",
		value: 0
	})).toBe(2);
});

test("Destructuring 5", () => {
	expect(dest({
		id: "008",
		name: null,
		value: 0
	})).toBe(2);
});

test("Destructuring 6", () => {
	expect(dest({
		id: "009",
		name: null,
		value: 0,
		detail: { v1: 0, v2: 9, v3: 14 }
	})).toBe(3);
});

test("Destructuring 7", () => {
	expect(dest({
		value: 0,
		flag: false
	})).toBe(1);
});

test("Destructuring 8", () => {
	expect(dest({
		value: -1,
		flag: true
	})).toBe(2);
});
