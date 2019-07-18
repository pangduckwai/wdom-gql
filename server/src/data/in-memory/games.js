
let store = [];

module.exports.list = () => {
	return new Promise((resolve, _) => {
		resolve(store);
	});
};

module.exports.find = ({ id }) => {
	return new Promise((resolve, reject) => {
		const result = store[id];
		if (result && result.active) {
			resolve(result);
		} else {
			reject(`Game ${id} not found`);
		}
	});
};

module.exports.create = (name, player) => {
	return new Promise((resolve, reject) => {
		const rslt = store.filter(g => g.active && ((g.name === name) || (g.host === player.token)));
		if (player.joined && player.joined.active) {
			reject(`Player '${player.name}' already joined game ${player.joined.name}`);
		} else if (rslt.length > 0) {
			reject(`Game '${name}' already exists`);
		} else {
			const id = store.length;
			const game = {
				id: id,
				name: name,
				host: player.token,
				rounds: 0,
				cardReinforcement: 4,
				continents: [],
				territories: [],
				active: true
			};
			const len = store.push(game);
			if (len > 0) {
				player.joined = game;
				resolve(game);
			} else {
				reject(`Add game '${game.name}' failed`);
			}
		}
	});
};

module.exports.updateRound = ({ id }) => {
	return new Promise((resolve, reject) => {
		const game = store[id];
		if (game && game.active) {
			game.rounds = game.rounds + 1;
		} else {
			reject(`Game '${id}' not found`);
		}
	});
};


module.exports.updateReinforcement = ({ id }) => {
	return new Promise((resolve, reject) => {
		const game = store[id];
		if (game && game.active) {
			game.cardReinforcement = game.cardReinforcement + 5;
		} else {
			reject(`Game '${id}' not found`);
		}
	});
};


module.exports.delete = ({ id }) => {
	return new Promise((resolve, reject) => {
		const game = store[id];
		if (game) {
			game.active = false;
			resolve(game);
		} else {
			reject(`Game ${id} not ended`);
		}
	});
};


// let conReducer = () => {
// 	return Object.keys(CONTINENTS).map(name => {
// 		let continent = {};
// 		continent["name"] = name;
// 		continent["reinforcement"] = CONTINENTS[name].reinforcement;
// 	});
// }

// let trrReducer = () => {
// 	return Object.keys(TERRITORIES).map(name => {
// 		let territory = {};
// 		territory["name"] = name;
// 		territory["continent"] = TERRITORIES[name].continent;
// 		territory["army"] = 0;
// 	});
// }
