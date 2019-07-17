const { list, find, join, leave } = require("../in-memory/players");

afterAll(() => {
	list().then(list => {
		console.log(list);
	});
});

test("Get existing player", () => {
	return expect(find({ token: "123456789001" })).rejects.toBe("Player not found");
});

test("Get existing player", () => {
	return expect(find({ name: "Paul" })).rejects.toBe("Player 'Paul' not found");
});

test("Add new player 'Paul'", () => {
	return join({ name: "Paul" }).then(player => {
		expect(player.name).toBe("Paul");
	});
});

test("Add new player 'Rick'", () => {
	return join({ name: "Rick" }).then(player => {
		expect(player.name).toBe("Rick");
	});
});

test("Add new player 'John'", () => {
	return join({ name: "John" }).then(player => {
		expect(player.name).toBe("John");
	});
});

test("Add player with duplicated name 'RiCk'", () => {
	return expect(join({ name: "RiCk" })).rejects.toBe("Player 'Rick' already exists");
});

test("Test a player leave and add another with the same name", () => {
	return find({ name: "Rick" }).then(po => {
		leave(po).then(_ => {
			join({ name: "Rick" }).then(pn => {
				expect(pn.name).toBe("Rick");
			});
		});
	});
});
