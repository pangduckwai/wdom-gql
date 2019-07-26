const { copyGame } = require('./copy');
const { territoryReducer, cardReinforcement } = require('../rules');

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

	create({ name, token }) {
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
					rounds: -1,
					cardReinforcement: 0,
					territories: territoryReducer(id),
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

	update({ id, rounds, cards, territory = { name: null, owner: null, army: -1 }}) {
		return new Promise((resolve, reject) => {
			if ((typeof(id) !== "undefined") && (id !== null)) {
				const game = this.store[id];
				if (game && game.active) {
					if (rounds) {
						game.rounds = game.rounds + 1;
					}
					if (cards) {
						game.cardReinforcement = cardReinforcement(game.cardReinforcement);
					}
					if (territory.name !== null) {
						for (let t of game.territories) {
							if (t.name === territory.name) {
								if ((typeof(territory.owner) !== "undefined") && (territory.owner !== null)) {
									t.ptkn = territory.owner;
								}
								if (territory.army >= 0) {
									t.army = territory.army;
								}
								break;
							}
						}
					}
					resolve(copyGame(game));
				} else
					reject(new Error(`Game '${id} not found`));
			} else
				reject(new Error("Invalid game input"));
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
};

module.exports = GameStore;