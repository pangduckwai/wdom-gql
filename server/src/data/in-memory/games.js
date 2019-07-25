const { copyGame } = require('./copy');
const { TERRITORIES } = require('../constants');

//type Game {
// 	id: ID!
// 	name: String!
// 	ptkn: String!      #### player token (host)
// 	rounds: Int!
// 	cardReinforcement: Int!
// 	territories: [Territory]!
//}
//type Territory {
// 	name: String!
//  gid: ID!
// 	continent: String!
// 	ptkn: String       #### player token (owner)
// 	army: Int!
//}
class GameStore {
	constructor() {
		this.store = [];
	}

	list() {
		return new Promise((resolve, _) => {
			resolve(this.store.filter(g => g.active).map(g => copyGame(g)));
		});
	};

	find({ id }) {
		return new Promise((resolve, _) => {
			let ret = [];
			const result = this.store[id];
			if (result && result.active) ret.push(copyGame(result));
			resolve(ret);
		});
	};

	findAny({ id }) {
		return new Promise((resolve, _) => {
			let ret = [];
			const result = this.store[id];
			if (result) ret.push(copyGame(result));
			resolve(ret);
		});
	};

	findByHost({ token }) {
		return new Promise((resolve, _) => {
			let ret = [];
			const result = this.store.filter(g => g.active && (g.ptkn === token));
			if (result.length === 1) ret.push(copyGame(result[0]));
			resolve(ret);
		});
	};

	create({ name }, { token }) {
		return new Promise((resolve, reject) => {
			const rslt = this.store.filter(g => g.active && ((g.name === name) || (g.ptkn === token)));
			if (rslt.length > 0) {
				reject(new Error(`Game '${name}' already exists`));
			} else {
				const id = '' + this.store.length;
				const game = {
					id: id,
					name: name,
					ptkn: token,
					rounds: 0,
					cardReinforcement: 4,
					territories: this.territoryReducer({ id }),
					active: true
				};
				const len = this.store.push(game);
				if (len > 0) {
					resolve(copyGame(game));
				} else {
					reject(new Error(`Add game '${game.name}' failed`));
				}
			}
		});
	};

	updateRound({ id }) {
		return new Promise((resolve, reject) => {
			const game = this.store[id];
			if (game && game.active) {
				game.rounds = game.rounds + 1;
				resolve(copyGame(game));
			} else {
				reject(new Error(`Game '${id}' not found`));
			}
		});
	};

	updateReinforcement({ id }) {
		return new Promise((resolve, reject) => {
			const game = this.store[id];
			if (game && game.active) {
				game.cardReinforcement = game.cardReinforcement + 5;
				resolve(copyGame(game));
			} else {
				reject(new Error(`Game '${id}' not found`));
			}
		});
	};

	remove({ id }) {
		return new Promise((resolve, reject) => {
			const game = this.store[id];
			if (game && game.active) {
				game.active = false;
				resolve(copyGame(game));
			} else {
				reject(new Error(`Game ${id} not removed`));
			}
		});
	};

	conquer({ id }, { name }, { token }) {
		return new Promise((resolve, reject) => {
			const game = this.store[id];
			if (game && game.active) {
				for (let t of game.territories) {
					if (t.name === name) {
						t.ptkn = token;
						resolve(copyGame(game));
						return;
					}
				}
				reject(new Error(`Invalid territory ${name}`));
			} else {
				reject(new Error(`Game '${id}' not found`));
			}
		});
	};

	territoryReducer({ id }) {
		return Object.keys(TERRITORIES).map(name => {
			let territory = {};
			territory["name"] = name;
			territory["gid"] = id;
			territory["continent"] = TERRITORIES[name].continent;
			territory["army"] = 0;
			return territory;
		});
	};
};

module.exports = GameStore;