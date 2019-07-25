const players = require("../players");
const { list, create, remove, find, findByHost, updateRound, updateReinforcement } = require("../games");
// import { create as createPlayer, findByName} from '../players';
// import { list, create, updateRound, updateReinforcement, remove, find, findByHost } from '../games';

beforeAll(() => {
	players.create({ name: "Paul" });
	players.create({ name: "Rick" });
	players.create({ name: "John" });
	players.create({ name: "Josh" });
});

afterAll(() => {
	list().then(list => {
		console.log(list);
	});
});

let id = -1;

test("Add new game 'Pauls Game'", () => {
	return players.findByName({ name: "Paul" }).then(player => {
		create("Pauls Game", player).then(game => {
			id = game.id;
			expect(game.name).toBe("Pauls Game");
		});
	});
});

test("Add new game 'Ricks Game'", () => {
	return players.findByName({ name: "Rick" }).then(player => {
		create("Ricks Game", player).then(game => {
			expect(game.name).toBe("Ricks Game");
		});
	});
});

test("Add game with duplicated name", () => {
	return players.findByName({ name: "John" }).then(player => {
		expect(create("Ricks Game", player)).rejects.toBe("Game 'Ricks Game' already exists");
	});
});

test("Add new game 'Joshs Game'", () => {
	return players.findByName({ name: "Josh" }).then(player => {
		create("Joshs Game", player).then(game => {
			expect(game.name).toBe("Joshs Game");
		});
	});
});

test("Add game with a busy host", () => {
	return players.findByName({ name: "Paul" }).then(player => {
		expect(create("New Game", player)).rejects.toBe("Player 'Paul' already joined game 'Pauls Game'");
	});
});

test("Find game", () => {
	return find({ id: id }).then(game => {
		expect(game.name).toBe("Pauls Game");
	});
});

test("Find game by host", () => {
	return players.findByName({ name: "Paul" }).then(player => {
		findByHost(player).then(game => {
			expect(game.name).toBe("Pauls Game");
		}).catch(error => {
			console.log(error);
		});
	});
});

test("Player not hosting game", () => {
	return players.findByName({ name: "John" }).then(player => {
		expect(findByHost(player)).rejects.toBe("Player is not hosting any game");
	});
});

test("Remove someone else's game", () => {
	return players.findByName({ name: "Paul" }).then(p1 => {
		players.findByName({ name: "Rick" }).then(p2 => {
			findByHost(p2).then(game => {
				expect(remove(game, p1)).rejects.toBe(`Game ${game.id} not removed`);
			});
		});
	});
});

test("Next Round", () => {
	return updateRound({ id: id }).then(game => {
		expect(game.name).toBe("Pauls Game");
	});
});

test("Trade cards", () => {
	return updateReinforcement({ id: id }).then(game => {
		expect(game.name).toBe("Pauls Game");
	});
});

test("Remove game", () => {
	return players.findByName({ name: "Paul" }).then(player => {
		findByHost(player).then(game => {
			remove(game, player).then(game => {
				expect(game.name).toBe("Pauls Game");
			}).catch(error => {
				console.log(error);
			});
		});
	});
});
