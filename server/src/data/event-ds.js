const { DataSource } = require('apollo-datasource');
const evn = require('../const-events');

class EventDS extends DataSource {
	constructor({ store, rules }) {
		super();
		this.store = store;
		this.gameRules = rules;
	}

	initialize(config) {
		this.context = config.context;
	}

	async events() {
		return this.store.list({ index: 0 });
	}
	me() {
		if (this.context && this.context.token)
			return this.findPlayerByToken({ token: this.context.token });
		else
			return null;
	}
	listPlayers() {
		return this.store.players;
	};
	findPlayerByToken({ token }) {
		return this.store.players[this.store.idxPlayerToken[token]];
	}
	findPlayerByName({ name }) {
		return this.store.players[this.store.idxPlayerName[name]];
	}
	listPlayersByGame({ token }) {
		return this.store.players.filter(p => (typeof(p.joined) !== "undefined") && (p.joined === token));
	}

	listGames() {
		return this.store.games;
	}
	findGameByToken({ token }) {
		return this.store.games[this.store.idxGameToken[token]];
	}
	findGameByName({ name }) {
		return this.store.games[this.store.idxGameName[name]];
	}

	listTerritoriesByPlayer({ token }) {
		return this.store.games[this.store.idxGameToken[this.store.players[this.store.idxPlayerToken[token]].joined]].territories.filter(t => 
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
				len = this.store.players.push(obj);
				if (len > 0) this.store.rebuildPlayerIndex();
				break;
			case evn.PLAYER_QUITTED.id:
				obj = this.store.players[this.store.idxPlayerToken[v.token]];
				if (obj) {
					this.store.players.splice(this.store.idxPlayerToken[v.token], 1);
					this.store.rebuildPlayerIndex();
				}
				break;
			case evn.GAME_JOINED.id:
				obj = this.store.players[this.store.idxPlayerToken[v.data[0]]];
				if (obj) {
					obj.joined = v.token;
					obj.reinforcement = 0;
					obj.cards = [];
				}
				break;
			case evn.GAME_LEFT.id:
				obj = this.store.players[this.store.idxPlayerToken[v.data[0]]];
				if (obj) {
					delete obj.joined;
				}
				break;
			case evn.TROOP_ASSIGNED.id:
				obj = this.store.players[this.store.idxPlayerToken[v.token]];
				if (obj) {
					if (v.amount >= 0) {
						obj.reinforcement = obj.reinforcement + v.amount;
					} else {
						obj.ready = false;
					}
				}
				break;
			case evn.TROOP_DEPLOYED.id:
				obj = this.store.players[this.store.idxPlayerToken[v.token]];
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

				len = this.store.games.push(obj);
				if (len > 0) this.store.rebuildGameIndex();
				break;
			case evn.GAME_CLOSED.id:
				obj = this.store.games[this.store.idxGameToken[v.token]];
				if (obj && (obj.host === v.data[0])) { //Only the host can close a game
					this.store.games.splice(this.store.idxGameToken[v.token], 1);
					this.store.rebuildGameIndex();
				}
				break;
			case evn.GAME_STARTED.id:
				obj = this.store.games[this.store.idxGameToken[v.token]];
				if (obj && (obj.host === v.data[0])) { //Only the host can start a game
					obj.turn = obj.host;
					obj.rounds = 0;
				}
				break;
			case evn.TERRITORY_ASSIGNED.id:
				obj = this.store.games[this.store.idxGameToken[v.token]];
				if (obj) {
					obj.territories[obj.t_index[v.name]].owner = v.data[0];
					obj.territories[obj.t_index[v.name]].troops = 1;
				}
				break;
			case evn.TROOP_ADDED.id:
				obj = this.store.games[this.store.idxGameToken[v.token]];
				if (obj && (obj.territories[obj.t_index[v.name]].owner === v.data[0])) {
					obj.territories[obj.t_index[v.name]].troops = obj.territories[obj.t_index[v.name]].troops + v.amount;
				}
				break;
			case evn.TERRITORY_SELECTED.id:
				obj = this.store.games[this.store.idxGameToken[v.token]];
				if (obj && (obj.territories[obj.t_index[v.name]].owner === v.data[0])) {
					obj.current = v.name;
				}
				break;
			case evn.NEXT_PLAYER.id:
				obj = this.store.games[this.store.idxGameToken[v.token]];
				if (obj && (obj.turn === v.data[0])) {
					const plys = this.listPlayersByGame({ token: v.token });
					let idx = 0;
					for (const ply of plys) {
						if (ply.token === v.data[0]) break;
						idx ++;
					}
					let off = ((idx + 1) >= plys.length) ? 0 : idx + 1;

					if (obj.rounds === 0) {
						// Setup phase
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
						while (this.listTerritoriesByPlayer({ token: plys[off].token }).length <= 0) {
							off ++;
							if (off >= plys.length) off = 0;
						}
						if (off !== idx)
							obj.turn = plys[off].token;
						else {
							obj.winner = v.data[0];
						}
					}
				}
				break;
			case evn.SETUP_FINISHED.id:
				obj = this.store.games[this.store.idxGameToken[v.token]];
				if (obj && (obj.rounds === 0)) {
					obj.turn = obj.host;
					obj.rounds = 1;
				}
				break;
			case evn.TURN_STARTED.id:
				obj = this.store.games[this.store.idxGameToken[v.token]];
				if (obj && (obj.turn === v.data[0])) {
					obj.fortified = false;
					const ply = this.store.players[this.store.idxPlayerToken[v.data[0]]];
					if (ply) ply.conquer = false;
				}
				break;
			case evn.CARD_RETURNED.id:
				obj = this.store.games[this.store.idxGameToken[v.token]];
				if (obj && ((obj.rounds === 0) || (obj.turn === v.data[0]))) {
					const card = this.gameRules.getCard(v.name);
					if (card && (obj.cards.filter(c => c.name === v.name).length <= 0)) {
						obj.cards.push(card);
					}
				}
				break;
			case evn.CARDS_REDEEMED.id: //TODO test a player redeem 2 sets of cards in 1 round
				obj = this.store.games[this.store.idxGameToken[v.token]];
				if (obj && (obj.turn === v.data[0])) {
					const reinforcement = this.gameRules.redeemReinforcement(obj.redeemed);
					const ply = this.store.players[this.store.idxPlayerToken[v.data[0]]];
					if (ply) {
						obj.redeemed = reinforcement;
						ply.reinforcement += reinforcement;
						ply.cards = ply.cards.filter(c => (c.name !== v.data[2]) && (c.name !== v.data[3]) && (c.name !== v.data[4]));

						const territories = this.listTerritoriesByPlayer({token: v.data[0]})
						for (let i = 2; i < v.data.length; i ++) {
							const territory = territories.filter(t => t.name === v.data[i]);
							if (territory.length > 0) territory[0].troops += 2;
						}
					}
				}
				break;
			case evn.TERRITORY_ATTACKED.id:
				obj = this.store.games[this.store.idxGameToken[v.token]];
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
				obj = this.store.games[this.store.idxGameToken[v.token]];
				if (obj && (obj.turn === v.data[0])) {
					const fm = obj.territories[obj.t_index[v.data[2]]];
					const to = obj.territories[obj.t_index[v.data[3]]];
					to.owner = v.data[0];
					to.troops = fm.troops - 1;
					fm.troops = 1;
					obj.current = v.data[3];

					const ply = this.store.players[this.store.idxPlayerToken[v.data[0]]];
					if (ply) ply.conquer = true;
				}
				break;
			case evn.PLAYER_ATTACKED.id:
				obj = this.store.players[this.store.idxPlayerToken[v.token]];
				if (obj) {
					const ply = this.store.players[this.store.idxPlayerToken[v.data[2]]];
					const left = this.listTerritoriesByPlayer({ token: v.data[2] });
					if (left.length <= 0) {
						//Player defeated
						obj.cards.push(...ply.cards);
						ply.cards = [];
					}
				}
				break;
			case evn.FORTIFIED.id:
				obj = this.store.games[this.store.idxGameToken[v.token]];
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
				obj = this.store.games[this.store.idxGameToken[v.token]];
				if (obj && (obj.turn === v.data[0])) {
					obj.rounds ++;

					const ply = this.store.players[this.store.idxPlayerToken[v.data[0]]];
					if (ply && ply.conquer) {
						const card = obj.cards.splice(0, 1)[0];
						ply.cards.push(card);
					}
				}
				break;
		}
	}

	async updateSnapshot() {
		return new Promise(async (resolve, _) => {
			const { lastIndex, eventList } = await this.store.list({ index: this.store.snapshot + 1 });
			this.store.snapshot = lastIndex;

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