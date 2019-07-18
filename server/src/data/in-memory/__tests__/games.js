const { register, find } = require("../players");
const { list, create, join, end, findById, findByHost } = require("../games");

beforeAll(() => {
	register({ name: "Paul" });
	register({ name: "Rick" });
	register({ name: "John" });
	register({ name: "Josh" });
});

afterAll(() => {
	list().then(list => {
		console.log(list);
	});
});

test("Add new game 'Pauls Game'", () => {
	return find({ name: "Paul" }).then(player => {
		let lst = [];
		lst.push(player);
		create({
			name: "Pauls Game",
			players: lst,
			rounds: 0,
			cardReinforcement: 0,
			continents: [],
			territories: []
		}).then(game => {
			expect(game.name).toBe("Pauls Game");
		});
	});
});

test("Add new game 'Ricks Game'", () => {
	return find({ name: "Rick" }).then(player => {
		let lst = [];
		lst.push(player);
		create({
			name: "Ricks Game",
			players: lst,
			rounds: 0,
			cardReinforcement: 0,
			continents: [],
			territories: []
		}).then(game => {
			expect(game.name).toBe("Ricks Game");
		});
	});
});

test("Add game with duplicated name", () => {
	return find({ name: "John" }).then(player => {
		let lst = [];
		lst.push(player);
		expect(create({
			name: "Ricks Game",
			players: lst,
			rounds: 0,
			cardReinforcement: 0,
			continents: [],
			territories: []
		})).rejects.toBe("Game 'Ricks Game' already exists");
	});
});

test("Add new game 'Joshs Game'", () => {
	return find({ name: "Josh" }).then(player => {
		let lst = [];
		lst.push(player);
		create({
			name: "Joshs Game",
			players: lst,
			rounds: 0,
			cardReinforcement: 0,
			continents: [],
			territories: []
		}).then(game => {
			expect(game.name).toBe("Joshs Game");
		});
	});
});

test("Add game with a busy host", () => {
	return find({ name: "Paul" }).then(player => {
		let lst = [];
		lst.push(player);
		expect(create({
			name: "New Game",
			players: lst,
			rounds: 0,
			cardReinforcement: 0,
			continents: [],
			territories: []
		})).rejects.toBe("Player 'Paul' already hosting another game");
	});
});

test("Find game", () => {
	return findById({ id: 0 }).then(game => {
		expect(game.name).toBe("Pauls Game");
	});
});

test("Find game by host", () => {
	return find({ name: "Paul" }).then(player => {
		findByHost(player).then(game => {
			expect(game.name).toBe("Pauls Game");
		}).catch(error => {
			console.log(error);
		});
	});
});

test("Player not hosting game", () => {
	return find({ name: "John" }).then(player => {
		expect(findByHost(player)).rejects.toBe("Player 'John' not hosting any game");
	});
});

test("End someone else's game", () => {
	return find({ name: "Paul" }).then(p1 => {
		find({ name: "Rick" }).then(p2 => {
			findByHost(p2).then(game => {
				expect(end(game, p1)).rejects.toBe(`Game ${game.id} not ended`);
			});
		});
	});
});

test("End game", () => {
	return find({ name: "Paul" }).then(player => {
		findByHost(player).then(game => {
			end(game, player).then(game => {
				expect(game.name).toBe("Pauls Game");
			}).catch(error => {
				console.log(error);
			});
		});
	});
});

test("Joining two games", () => {
	return find({ name: "Josh" }).then(p1 => {
		find({ name: "Rick" }).then(p2 => {
			findByHost(p2).then(game => {
				expect(join(game, p1)).rejects.toBe("Unable to join game 'Ricks Game'");
			});
		});
	});
});

test("Join game", () => {
	return find({ name: "Paul" }).then(p1 => {
		find({ name: "Rick" }).then(p2 => {
			findByHost(p2).then(game => {
				join(game, p1).then(game => {
					expect(game.name).toBe("Ricks Game");
				}).catch(error => {
					console.log(error);
				});
			});
		});
	});
});

test("Join game", () => {
	return find({ name: "John" }).then(p1 => {
		find({ name: "Rick" }).then(p2 => {
			findByHost(p2).then(game => {
				join(game, p1).then(game => {
					expect(game.name).toBe("Ricks Game");
				}).catch(error => {
					console.log(error);
				});
			});
		});
	});
});