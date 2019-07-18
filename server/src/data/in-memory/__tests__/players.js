const { listAll, find, findByName, create, remove } = require("../players");

afterAll(() => {
	listAll().then(list => {
		console.log(list);
	});
});

test("Get existing player", () => {
	return expect(find({ token: "123456789001" })).rejects.toBe("Player not found");
});

test("Add new player 'Paul'", () => {
	return create({ name: "Paul" }).then(player => {
		expect(player.name).toBe("Paul");
	});
});

test("Add new player 'Rick'", () => {
	return create({ name: "Rick" }).then(player => {
		expect(player.name).toBe("Rick");
	});
});

test("Add new player 'John'", () => {
	return create({ name: "John" }).then(player => {
		expect(player.name).toBe("John");
	});
});

test("Get existing player", () => {
	return findByName({ name: "paul" }).then(player => {
		expect(player.name).toBe("Paul");
	});
});

test("Add player with duplicated name 'RiCk'", () => {
	return expect(create({ name: "RiCk" })).rejects.toBe("Player 'Rick' already exists");
});

test("Test a player quit and add another with the same name", () => {
	return findByName({ name: "Rick" }).then(po => {
		remove(po).then(_ => {
			create({ name: "Rick" }).then(pn => {
				expect(pn.name).toBe("Rick");
			});
		});
	});
});
