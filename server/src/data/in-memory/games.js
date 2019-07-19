const { copyGame } = require('./copy');

//type Game {
// 	id: ID!
// 	name: String!
// 	host: String!      #### player token
// 	rounds: Int!
// 	cardReinforcement: Int!
// 	territories: [Territory]!
//}
//type Territory {
// 	name: String!
// 	continent: String!
// 	owner: String!     #### player token
// 	army: Int!
//}
class GameStore {
	constructor() {
		this.store = [];
	}

	list() {
		return new Promise((resolve, _) => {
			resolve(this.store.map(g => copyGame(g)));
		});
	};

	find({ id }) {
		return new Promise((resolve, reject) => {
			const result = this.store[id];
			if (result && result.active) {
				resolve(copyGame(result));
			} else {
				reject(new Error(`Game ${id} not found`));
			}
		});
	};

	findByHost({ token }) {
		return new Promise((resolve, reject) => {
			const result = this.store.filter(g => g.active && (g.host === token));
			if (result.length === 1) {
				resolve(copyGame(result[0]));
			} else {
				reject(new Error(`Player is not hosting any game`));
			}
		});
	};

	create({ name }, { token }) {
		return new Promise((resolve, reject) => {
			const rslt = this.store.filter(g => g.active && ((g.name === name) || (g.host === token)));
			if (rslt.length > 0) {
				reject(new Error(`Game '${name}' already exists`));
			} else {
				const id = this.store.length;
				const game = {
					id: id,
					name: name,
					host: token,
					rounds: 0,
					cardReinforcement: 4,
					territories: this.territoryReducer(),
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

	territoryReducer() {
		return Object.keys(TERRITORIES).map(name => {
			let territory = {};
			territory["name"] = name;
			territory["continent"] = TERRITORIES[name].continent;
			territory["army"] = 0;
		});
	};
};

module.exports = GameStore;