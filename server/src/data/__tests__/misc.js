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

let TERRITORIES = {
	"Congo": {
	 continent: "Africa", connected: ["East-Africa", "North-Africa", "South-Africa"]
 }, "East-Africa": {
	 continent: "Africa", connected: ["Congo", "Egypt", "Madagascar", "North-Africa", "South-Africa", "Middle-East"]
 }, "Egypt": {
	 continent: "Africa", connected: ["East-Africa", "North-Africa", "Middle-East", "Southern-Europe"]
 }, "Madagascar": {
	 continent: "Africa", connected: ["East-Africa", "South-Africa"]
 }, "North-Africa": {
	 continent: "Africa", connected: ["Congo", "Egypt", "East-Africa", "Southern-Europe", "Western-Europe", "Brazil"]
 }, "South-Africa": {
	 continent: "Africa", connected: ["Congo", "East-Africa", "Madagascar"]
 }, "Afghanistan": {
	 continent: "Asia", connected: ["China", "India", "Middle-East", "Ural", "Ukraine"]
 }, "China": {
	 continent: "Asia", connected: ["Afghanistan", "India", "Manchuria", "Siam", "Siberia", "Ural"]
 }, "India": {
	 continent: "Asia", connected: ["Afghanistan", "China", "Middle-East", "Siam"]
 }, "Irkutsk": {
	 continent: "Asia", connected: ["Kamchatka", "Manchuria", "Siberia", "Yakutsk"]
 }, "Japan": {
	 continent: "Asia", connected: ["Kamchatka", "Manchuria"]
 }, "Kamchatka": {
	 continent: "Asia", connected: ["Irkutsk", "Japan", "Manchuria", "Yakutsk", "Alaska"]
 }, "Manchuria": {
	 continent: "Asia", connected: ["China", "Irkutsk", "Japan", "Kamchatka", "Siberia"]
 }, "Middle-East": {
	 continent: "Asia", connected: ["Afghanistan", "India", "Egypt", "East-Africa", "Southern-Europe", "Ukraine"]
 }, "Siam": {
	 continent: "Asia", connected: ["China", "India", "Indonesia"]
 }, "Siberia": {
	 continent: "Asia", connected: ["China", "Irkutsk", "Manchuria", "Ural", "Yakutsk"]
 }, "Ural": {
	 continent: "Asia", connected: ["Afghanistan", "China", "Siberia", "Ukraine"]
 }, "Yakutsk": {
	 continent: "Asia", connected: ["Irkutsk", "Kamchatka", "Siberia"]
 }, "Eastern-Australia": {
	 continent: "Australia", connected: ["New-Guinea", "Western-Australia"]
 }, "Indonesia": {
	 continent: "Australia", connected: ["New-Guinea", "Western-Australia", "Siam"]
 }, "New-Guinea": {
	 continent: "Australia", connected: ["Eastern-Australia", "Indonesia", "Western-Australia"]
 }, "Western-Australia": {
	 continent: "Australia", connected: ["Eastern-Australia", "Indonesia", "New-Guinea"]
 }, "Great-Britain": {
	 continent: "Europe", connected: ["Iceland", "Northern-Europe", "Scandinavia", "Western-Europe"]
 }, "Iceland": {
	 continent: "Europe", connected: ["Great-Britain", "Scandinavia", "Greenland"]
 }, "Northern-Europe": {
	 continent: "Europe", connected: ["Great-Britain", "Scandinavia", "Southern-Europe", "Ukraine", "Western-Europe"]
 }, "Scandinavia": {
	 continent: "Europe", connected: ["Great-Britain", "Iceland", "Northern-Europe", "Ukraine"]
 }, "Southern-Europe": {
	 continent: "Europe", connected: ["Northern-Europe", "Ukraine", "Western-Europe", "Egypt", "North-Africa", "Middle-East"]
 }, "Ukraine": {
	 continent: "Europe", connected: ["Northern-Europe", "Scandinavia", "Southern-Europe", "Afghanistan", "Middle-East", "Ural"]
 }, "Western-Europe": {
	 continent: "Europe", connected: ["Great-Britain", "Northern-Europe", "Southern-Europe", "North-Africa"]
 }, "Alaska": {
	 continent: "North-America", connected: ["Alberta", "Northwest-Territory", "Kamchatka"]
 }, "Alberta": {
	 continent: "North-America", connected: ["Alaska", "Northwest-Territory", "Ontario", "Western-United-States"]
 }, "Eastern-United-States": {
	 continent: "North-America", connected: ["Mexico", "Ontario", "Quebec", "Western-United-States"]
 }, "Greenland": {
	 continent: "North-America", connected: ["Northwest-Territory", "Ontario", "Quebec", "Iceland"]
 }, "Mexico": {
	 continent: "North-America", connected: ["Eastern-United-States", "Western-United-States", "Venezuela"]
 }, "Northwest-Territory": {
	 continent: "North-America", connected: ["Alaska", "Alberta", "Greenland", "Ontario"]
 }, "Ontario": {
	 continent: "North-America", connected: ["Alberta", "Eastern-United-States", "Greenland", "Northwest-Territory", "Quebec", "Western-United-States"]
 }, "Quebec": {
	 continent: "North-America", connected: ["Eastern-United-States", "Greenland", "Ontario"]
 }, "Western-United-States": {
	 continent: "North-America", connected: ["Alberta", "Eastern-United-States", "Mexico", "Ontario"]
 }, "Argentina": {
	 continent: "South-America", connected: ["Brazil", "Peru"]
 }, "Brazil": {
	 continent: "South-America", connected: ["Argentina", "Peru", "Venezuela", "North-Africa"]
 }, "Peru": {
	 continent: "South-America", connected: ["Argentina", "Brazil", "Venezuela"]
 }, "Venezuela": {
	 continent: "South-America", connected: ["Brazil", "Peru", "Mexico"]
 }
};

let shuffleCards = (tokens) => {
	let cards = Object.keys(TERRITORIES);
	let size = cards.length;

	while (size > 0) {
		let idx = Math.floor(Math.random() * size);
		size --;

		let tmp = cards[size];
		cards[size] = cards[idx];
		cards[idx] = tmp;
	}

	let ret = {};
	let index = 0;
	for (let v of cards) {
		ret[v] = tokens[index % tokens.length];
		index ++;
	}
	return ret;
};

test("Shuffle", () => {
	let tokens = ['A', 'B', 'C', 'D', 'E', 'F'];
	let result = shuffleCards(tokens);
	console.log(JSON.stringify(result));
	expect(Object.keys(result).length).toBe(42);
});
