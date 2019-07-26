const crypto = require('crypto');
const { copyPlayer } = require('./copy');

//type Player {
// 	token: String!
// 	name:  String!
//	reinforcement: Int!
// 	gid:   Int     #### game id
//}
class PlayerStore {
	constructor() {
		this.store = [];
		this.idxToken = {};
		this.idxName = {};
	}

	rebuildIndex() {
		this.idxToken = {};
		this.idxName = {};

		for (let idx = 0; idx < this.store.length; idx ++) {
			this.idxToken[this.store[idx].token] = idx;
			this.idxName[this.store[idx].name.toUpperCase()] = idx;
		}
	};

	listAll() {
		return new Promise((resolve, _) => {
			resolve(this.store.map(p => {
				return copyPlayer(p);
			}));
		});
	};

	list({ id }) {
		return new Promise((resolve, reject) => {
			const players = this.store.filter(p => (typeof(p.gid) !== "undefined") && (p.gid === id));
			if (players.length > 0) {
				resolve(players.map(q => copyPlayer(q)));
			} else {
				reject(new Error(`No player in the game ${id}`));
			}
		});
	};

	find({ token }) {
		return new Promise((resolve, reject) => {
			if (token) {
				const result = this.store[this.idxToken[token]];
				if (result) {
					resolve(copyPlayer(result));
				} else {
					reject(new Error("Player not found"));
				}
			} else {
				reject(new Error("Must provide the token of the player"));
			}
		});
	};

	findByName({ name }) {
		return new Promise((resolve, reject) => {
			if (name) {
				const result = this.store[this.idxName[name.toUpperCase()]];
				if (result) {
					resolve(copyPlayer(result));
				} else {
					reject(new Error(`Player '${name}' not found`));
				}
			} else {
				reject(new Error("Must provide the name of the player"));
			}
		});
	};

	create({ name }) {
		return new Promise((resolve, reject) => {
			if (name) {
				const result = this.store[this.idxName[name.toUpperCase()]];
				if (result) {
					reject(new Error(`Player '${result.name}' already exists`));
				} else {
					let token = crypto.createHash('sha256').update(name + (Math.floor(Math.random()*10000)).toString()).digest('base64');
					let player = {
						token: token,
						name: name,
						reinforcement: 0
					}
					let len = this.store.push(player);
					if (len > 0) {
						this.rebuildIndex();
						resolve(copyPlayer(player));
					} else {
						reject(new Error(`Add player '${name}' failed`));
					}
				}
			} else {
				reject(new Error("Must provide the player name"));
			}
		});
	};

	update({ token, id, reinforcement }) {
		return new Promise((resolve, reject) => {
			if ((typeof(token) !== "undefined") && (token !== null)) {
				const player = this.store[this.idxToken[token]];
				if (player) {
					if ((typeof(id) !== "undefined") && (id !== null)) {
						if (id !== "") player.gid = id; // id = "" noop
					} else {
						delete player.gid;
					}
					if ((typeof(reinforcement) !== "undefined") && (reinforcement !== null) && (reinforcement >= 0)) {
						player.reinforcement = reinforcement;
					}
					resolve(copyPlayer(player));
				}
			} else {
				reject(new Error("Invalid player input"));
			}
		});
	};

	remove({ token }) {
		return new Promise((resolve, reject) => {
			if (token) {
				const result = this.store[this.idxToken[token]];
				if (result) {
					this.store.splice(this.idxToken[token], 1);
					this.rebuildIndex();
					resolve(result);
				} else {
					reject(new Error("Player not found"));
				}
			} else {
				reject(new Error("Must provide the player token"));
			}
		});
	};
};

module.exports = PlayerStore;