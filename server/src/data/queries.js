const { DataSource } = require('apollo-datasource');
const evn = require('../events');
const { territoryReducer } = require('../rules');

/*
type Player {
	ready: Boolean!
	token: String!
	name: String!
	reinforcement: Int!
	joined: Game
}

type Game {
	ready: Boolean!
	token: String!
	name: String!
	host: Player!
	turn: Player
	rounds: Int!
	redeemed: Int!
	territories: [Territory]!
}

type Territory {
	name: String!
	continent: String!
	owner: Player
	troops: Int!
}
*/
class Queries extends DataSource {
	constructor({ store }) {
		super();
		this.store = store;
		this.players = [];
		this.games = [];
		this.idxPlayerToken = {};
		this.idxPlayerName = {};
		this.idxGameToken = {};
		this.idxGameName = {};
	}

	rebuildPlayerIndex() {
		this.idxPlayerToken = {};
		this.idxPlayerName = {};
		for (let i = 0; i < this.players.length; i ++) {
			this.idxPlayerToken[this.players[i].token] = i;
			this.idxPlayerName[this.players[i].name] = i;
		}
	};

	rebuildGameIndex() {
		this.idxGameToken = {};
		this.idxGameName = {};
		for (let j = 0; j < this.games.length; j ++) {
			this.idxGameToken[this.games[j].token] = j;
			this.idxGameName[this.games[j].name] = j;
		}
	};

	listPlayers() {
		return this.players;
	};
	findPlayerByToken({ token }) {
		return this.players[this.idxPlayerToken[token]];
	}
	findPlayerByName({ name }) {
		return this.players[this.idxPlayerName[name]];
	}
	listPlayersByGame({ token }) {
		return this.players.filter(p => (typeof(p.joined) !== "undefined") && (p.joined === token));
	}

	listGames() {
		return this.games;
	}
	findGameByToken({ token }) {
		return this.games[this.idxGameToken[token]];
	}
	findGameByName({ name }) {
		return this.games[this.idxGameName[name]];
	}

	async snapshot() {
		return new Promise(async (resolve, _) => {
			let obj;

			//Players
			this.players = [];
			this.idxPlayerToken = {};
			this.idxPlayerName = {};
			const registered = await this.store.find({ type: "P", event: evn.PLAYER_REGISTERED.id });
			for (const player of registered) {
				const events = await this.store.find({ token: player.eventid });
				for (const v of events) {
					switch (v.event) {
						case evn.PLAYER_REGISTERED.id:
							obj = {
								ready: true,
								token: v.token,
								name: v.name,
								reinforcement: 0
							};
							let len = this.players.push(obj);
							if (len > 0) this.rebuildPlayerIndex();
							break;
						case evn.PLAYER_QUITTED.id:
							obj = this.players[this.idxPlayerToken[v.token]];
							if (obj) {
								this.players.splice(this.idxPlayerToken[v.token], 1);
								this.rebuildPlayerIndex();
							}
							break;
						case evn.GAME_JOINED.id:
							obj = this.players[this.idxPlayerToken[v.token]];
							if (obj) {
								obj.joined = v.tokens[1];
							}
							break;
						case evn.GAME_LEFT.id:
							obj = this.players[this.idxPlayerToken[v.token]];
							if (obj) {
								delete obj.joined;
							}
							break;
						case evn.TROOP_ASSIGNED.id:
							obj = this.players[this.idxPlayerToken[v.token]];
							if (obj) {
								if (v.amount >= 0) {
									obj.reinforcement = obj.reinforcement + v.amount;
								} else {
									obj.ready = false;
								}
							}
							break;
						case evn.TROOP_DEPLOYED.id:
							obj = this.players[this.idxPlayerToken[v.token]];
							if (obj) {
								if ((v.amount >= 0) && (obj.reinforcement >= v.amount)) {
									obj.reinforcement = obj.reinforcement - v.amount;
								} else {
									obj.ready = false;
								}
							}
							break;
					}
				}
			}

			//Games...
			this.games = [];
			this.idxGameToken = {};
			this.idxGameName = {};
			const opened = await this.store.find({ type: "G", event: evn.GAME_OPENED.id });
			for (const game of opened) {
				const events = await this.store.find({ token: game.eventid });
				for (const v of events) {
					switch (v.event) {
						case evn.GAME_OPENED.id:
							obj = {
								ready: true,
								token: v.token,
								name: v.name,
								host: v.tokens[0],
								turn: v.tokens[0],
								rounds: -1,
								redeemed: 0,
								territories: territoryReducer(v.token)
							};
							let len = this.games.push(obj);
							if (len > 0) this.rebuildGameIndex();
							break;
						case evn.GAME_CLOSED.id:
							obj = this.games[this.idxGameToken[v.token]];
							if (obj && (obj.host === v.tokens[0])) { //Only the host can close a game
								this.games.splice(this.idxGameToken[v.token], 1);
								this.rebuildGameIndex();
							}
							break;
					}
				}
			}

			resolve(true);
		});
	}
};

module.exports = Queries;