const { DataSource } = require('apollo-datasource');
const evn = require('../events');

/*
type Player {
	ready: Boolean!
	token: String!
	name: String!
	reinforcement: Int!
	cards: [Card]!
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
	current: Territory
	cards: [Card]!
	territories: [Territory]!
}

type Territory {
	name: String!
	continent: String!
	owner: Player
	troops: Int!
}
*/
class EventDS extends DataSource {
	constructor({ store, rules }) {
		super();
		this.store = store;
		this.players = [];
		this.games = [];
		this.idxPlayerToken = {};
		this.idxPlayerName = {};
		this.idxGameToken = {};
		this.idxGameName = {};
		this.snapshot = -1;
		this.gameRules = rules;
	}

	initialize(config) {
		this.context = config.context;
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

	me() {
		if (this.context && this.context.token)
			return this.findPlayerByToken({ token: this.context.token });
		else
			return null;
	}
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

	listTerritoriesByPlayer({ token }) {
		return this.games[this.idxGameToken[this.players[this.idxPlayerToken[token]].joined]].territories.filter(t => 
			(typeof(t.owner) !== "undefined") && (t.owner === token)
		);
	}

	process(v) {
		let obj, len;

		switch (v.event) {
			//Player events
			case evn.PLAYER_REGISTERED.id:
				obj = {
					ready: true,
					token: v.token,
					name: v.name,
					reinforcement: 0,
					cards: [],
				};
				len = this.players.push(obj);
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
					obj.joined = v.data[1];
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

			// Game events
			case evn.GAME_OPENED.id:
				obj = {
					ready: true,
					token: v.token,
					name: v.name,
					host: v.data[0],
					rounds: -1,
					redeemed: 0,
					cards: [],
					territories: this.gameRules.buildTerritory(),
					t_index: {}
				};
				for (let i = 0; i < obj.territories.length; i ++) {
					obj.t_index[obj.territories[i].name] = i;
				}

				len = this.games.push(obj);
				if (len > 0) this.rebuildGameIndex();
				break;
			case evn.GAME_CLOSED.id:
				obj = this.games[this.idxGameToken[v.token]];
				if (obj && (obj.host === v.data[0])) { //Only the host can close a game
					this.games.splice(this.idxGameToken[v.token], 1);
					this.rebuildGameIndex();
				}
				break;
			case evn.GAME_STARTED.id:
				obj = this.games[this.idxGameToken[v.token]];
				if (obj && (obj.host === v.data[0])) { //Only the host can start a game
					obj.turn = obj.host;
					obj.rounds = 0;
				}
				break;
			case evn.TERRITORY_ASSIGNED.id:
				obj = this.games[this.idxGameToken[v.token]];
				if (obj) {
					obj.territories[obj.t_index[v.name]].owner = v.data[0];
					obj.territories[obj.t_index[v.name]].troops = 1;
				}
				break;
			case evn.TROOP_ADDED.id:
				obj = this.games[this.idxGameToken[v.token]];
				if (obj && (obj.territories[obj.t_index[v.name]].owner === v.data[0])) {
					obj.territories[obj.t_index[v.name]].troops = obj.territories[obj.t_index[v.name]].troops + v.amount;
				}
				break;
			// case evn.ACTION_TAKEN.id:
			// 	//TODO HERE - 
			// 	//NOTE!!! Event 'ACTION_TAKEN' not needed during setup phase, leave it just in case needed in playing phase
			// 	break;
			case evn.TERRITORY_SELECTED.id:
				obj = this.games[this.idxGameToken[v.token]];
				if (obj && (obj.territories[obj.t_index[v.name]].owner === v.data[0])) {
					obj.current = v.name;
				}
				break;
			case evn.NEXT_PLAYER.id:
				obj = this.games[this.idxGameToken[v.token]];
				if (obj && (obj.turn === v.data[0])) {
					const plys = this.players.filter(p => (typeof(p.joined) !== "undefined") && (p.joined === v.token));
					let idx = 0;
					for (const ply of plys) {
						idx ++;
						if (ply.token === v.data[0]) break;
					}
					if (idx >= plys.length) idx = 0;

					if (obj.rounds === 0) {
						// Setup phase
						let off = idx;
						let finished = false;
						while (plys[off].reinforcement <= 0) {
							off ++;
							if (off >= plys.length) off = 0;
							if (off === idx) {
								finished = true;
								break; //No one has reinforcement left
							}
						}
						if (!finished) obj.turn = plys[off].token;
					} else if (obj.rounds > 0) {
						let off = idx;
						let won = false;
						while (this.listTerritoriesByPlayer({ token: plys[off].token }).length <= 0) {
							console.log("NOTE!!!", plys[off].name, "is defeated");
							off ++;
							if (off >= plys.length) off = 0;
							if (off === idx) {
								won = ture;
								break; //No one else has any territory left
							}
						}
						if (!won)
							obj.turn = plys[off].token;
						else {
							if (!obj.winner) obj.winner = v.data[0];
						}
					}
				}
				break;
			case evn.SETUP_FINISHED.id:
				obj = this.games[this.idxGameToken[v.token]];
				if (obj && (obj.rounds === 0)) {
					obj.turn = obj.host;
					obj.rounds = 1;
				}
				break;
			case evn.TURN_STARTED.id:
				obj = this.games[this.idxGameToken[v.token]];
				if (obj && (obj.turn === v.data[0])) {
					obj.fortified = false;
					const ply = this.players[this.idxPlayerToken[v.data[0]]];
					if (ply) ply.conquer = false;
				}
				break;
			case evn.CARD_RETURNED.id:
				obj = this.games[this.idxGameToken[v.token]];
				if (obj && (obj.rounds === 0)) { //TODO NOTE here, should redeem card use this same event to put card back to end of deck?
					const card = this.gameRules.getCard(v.name);
					if (card && (obj.cards.filter(c => c.name === v.name).length <= 0)) {
						obj.cards.push(card);
					}
				}
				break;
			case evn.TERRITORY_ATTACKED.id:
				obj = this.games[this.idxGameToken[v.token]];
				if (obj && (obj.turn === v.data[0])) {
					const fm = obj.territories[obj.t_index[v.data[2]]];
					const to = obj.territories[obj.t_index[v.data[3]]];
					if (fm.troops > v.data[4])
						fm.troops -= v.data[4];
					else
						fm.troops = 1;
					if (to.troops >= v.data[5])
						to.troops -= v.data[5];
					else
						to.troops = 0;
				}
				break;
			case evn.TERRITORY_CONQUERED.id:
				obj = this.games[this.idxGameToken[v.token]];
				if (obj && (obj.turn === v.data[0])) {
					const fm = obj.territories[obj.t_index[v.data[2]]];
					const to = obj.territories[obj.t_index[v.data[3]]];
					to.owner = v.data[0];
					to.troops = fm.troops - 1;
					fm.troops = 1;
					obj.current = v.data[3];

					const ply = this.players[this.idxPlayerToken[v.data[0]]];
					if (ply) ply.conquer = true;
				}
				break;
			case evn.FORTIFIED.id:
				obj = this.games[this.idxGameToken[v.token]];
				if (obj && (obj.turn === v.data[0])) {
					const fm = obj.territories[obj.t_index[v.data[2]]];
					const to = obj.territories[obj.t_index[v.data[3]]];
					let value = (v.amount >= fm.troops) ? fm.troops - 1 : v.amount;
					to.troops += value;
					fm.troops -= value;
					obj.fortified = true;
					obj.current = v.data[3];
				}
				break;
			case evn.TURN_ENDED.id:
				obj = this.games[this.idxGameToken[v.token]];
				if (obj && (obj.turn === v.data[0])) {
					obj.rounds ++;

					const ply = this.players[this.idxPlayerToken[v.data[0]]];
					if (ply && ply.conquer) {
						const card = obj.cards.splice(0, 1)[0];
						ply.cards.push(card);
					}
				}
				break;
		}
	}

	async takeSnapshot() {
		return new Promise(async (resolve, _) => {
			const { lastIndex, eventList } = await this.store.list({ index: 0 }); // get all
			this.snapshot = lastIndex;

			this.players = [];
			this.idxPlayerToken = {};
			this.idxPlayerName = {};

			this.games = [];
			this.idxGameToken = {};
			this.idxGameName = {};

			if (lastIndex >= 0) {
				//Players
				const registered = eventList.filter(e => (e.type === "P") && (e.event === evn.PLAYER_REGISTERED.id)); //await this.store.find({ type: "P", event: evn.PLAYER_REGISTERED.id }); // to: this.snapshot,
				for (const player of registered) {
					const events = eventList.filter(e => (e.token === player.eventid)); //await this.store.find({ token: player.eventid });
					for (const v of events) {
						this.process(v);
					}
				}

				//Games
				const opened = eventList.filter(e => (e.type === "G") && (e.event === evn.GAME_OPENED.id)); //await this.store.find({ type: "G", event: evn.GAME_OPENED.id });
				for (const game of opened) {
					const events = eventList.filter(e => (e.token === game.eventid)); //await this.store.find({ token: game.eventid });
					for (const v of events) {
						this.process(v);
					}
				}
			}
			resolve(true);
		});
	}

	async updateSnapshot() {
		return new Promise(async (resolve, _) => {
			const { lastIndex, eventList } = await this.store.list({ index: this.snapshot + 1 });
			this.snapshot = lastIndex;

			if (lastIndex >= 0) {
				for (const event of eventList) {
					this.process(event);
				}
			}
			resolve(true);
		});
	}

	async add({ event, payload }) {
		return this.store.add({ event, payload });
	}
};

module.exports = EventDS;