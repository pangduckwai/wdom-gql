const { UserInputError } = require('apollo-server-express');
const crypto = require('crypto');
const consts = require('../consts');
const os = require('os');
const fs = require('fs');
const path = require('path');

let copy = (orig) => {
	let copy = {};
	copy.eventid = orig.eventid;
	copy.timestamp = orig.timestamp;
	copy.event = orig.event;
	copy.type = orig.type;
	copy.token = orig.token;

	copy.data = [];
	for (let dat of orig.data) {
		let itm = {};
		itm.name = dat.name;
		itm.value = dat.value;
		copy.data.push(itm);
	}
	return copy;
};

let populate = (event, token) => {
	event.token = token;
	return true;
}

class EventStore {
	constructor() {
		this.events = [];
		this.players = [];
		this.games = [];
		this.idxPlayerSession = {};
		this.idxPlayerToken = {};
		this.idxPlayerName = {};
		this.idxGameToken = {};
		this.idxGameName = {};
		this.snapshot = -1;
	}

	////////////////////////////////////////////////
	rebuildPlayerIndex() {
		this.idxPlayerSession = {};
		this.idxPlayerToken = {};
		this.idxPlayerName = {};
		for (let i = 0; i < this.players.length; i ++) {
			this.idxPlayerSession[this.players[i].sessionid] = i;
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

	////////////////////////////////////////////////
	list({ index }) {
		return new Promise((resolve, _) => {
			const len = this.events.length;
			const lst = (len > 0) ? this.events.slice(index).map(v => copy(v)) : [];
			resolve({ lastIndex: len - 1, eventList: lst });
		});
	}

	find({ from, to, type, event, token }) {
		return new Promise((resolve, _) => {
			resolve(this.events.filter(v =>
				((typeof(from) === "undefined")  || (from === null)  || (v.timestamp >= from)) &&
				((typeof(to) === "undefined")    || (to === null)    || (v.timestamp < to)) &&
				((typeof(type) === "undefined")  || (type === null)  || (v.type === type)) &&
				((typeof(event) === "undefined") || (event === null) || (v.event === event)) &&
				((typeof(token) === "undefined") || (token === null) || (v.token === token))
			).map(v => copy(v)));
		});
	}

	export() {
		const tmp = path.join(os.tmpdir(), `wdom${Date.now()}`);
		this.games.forEach((g, i) => {
			const players = this.players.filter(p => (typeof(p.joined) !== "undefined") && (p.joined === g.token));
			const events = this.events.filter(v => {
				for (let p of players) {
					if (v.token === p.token) return true;
				}
				return (v.token === g.token);
			}).sort((a, b) => {
				if (a.timestamp === b.timestamp) {
					return a.event - b.event;
				} else {
					return a.timestamp - b.timestamp;
				}
			});

			fs.mkdirSync(tmp, { recursive: true});
			const writer = fs.createWriteStream(path.join(tmp, `wdom-export${i}.txt`));
			for (let v of events) {
				writer.write(JSON.stringify(v) + '\n');
			}
			writer.end();
		});
	}

	// Adding events (these are not commands)
	add({ event, payload = [] }) {
		return new Promise((resolve, reject) => {
			let dtm = Date.now();
			let eid = crypto.createHash('sha256').update('' + (dtm + Math.floor(Math.random()*10000))).digest('base64');
			let obj = {
				eventid: eid,
				timestamp: dtm,
				event: event
			};
			let rspn = { successful: false };

			obj.data = [];
			for (let d of payload) {
				obj.data.push(d);
			}

			let fltr1, fltr2, fltr3, fltr4, fltr5, fltr6;
			switch (event) {
				case consts.PLAYER_REGISTERED:
					fltr1 = payload.filter(d => (d.name === "playerName"));
					if (fltr1.length !== 1) {
						rspn.message = "[REGISTER] Missing player name";
					} else {
						rspn.successful = populate(obj, crypto.createHash('sha256').update('' + (dtm + Math.floor(Math.random()*10000))).digest('base64')); // Generate play token
					}
					break;
				case consts.PLAYER_QUITTED:
					fltr1 = payload.filter(d => (d.name === "playerToken"));
					if (fltr1.length !== 1) {
						rspn.message = "[QUIT] Missing player ID";
					} else {
						rspn.successful = populate(obj, fltr1[0].value); //token of the player quitting
					}
					break;
				case consts.GAME_JOINED:
				case consts.GAME_LEFT:
				case consts.GAME_CLOSED:
				case consts.GAME_STARTED:
				case consts.NEXT_PLAYER:
				case consts.SETUP_FINISHED:
				case consts.TURN_ENDED:
					fltr1 = payload.filter(d => (d.name === "playerToken"));
					fltr2 = payload.filter(d => (d.name === "gameToken"));
					if ((fltr1.length !== 1) || (fltr2.length !== 1)) {
						rspn.message = "Missing player and/or game IDs";
					} else {
						rspn.successful = populate(obj, fltr2[0].value);
					}
					break;
				case consts.GAME_OPENED:
					fltr1 = payload.filter(d => (d.name === "playerToken"));
					fltr2 = payload.filter(d => (d.name === "gameName"));
					if (fltr1.length !== 1) {
						rspn.message = "[OPEN] Missing player ID";
					} else if (fltr2.length !== 1) {
						rspn.message = "[OPEN] Missing game name";
					} else {
						rspn.successful = populate(obj, eid); //event id is also the token of the game
					}
					break;
				case consts.TERRITORY_ASSIGNED:
				case consts.TERRITORY_SELECTED:
				case consts.CARD_RETURNED:
					fltr1 = payload.filter(d => (d.name === "playerToken"));
					fltr2 = payload.filter(d => (d.name === "gameToken"));
					fltr3 = payload.filter(d => (d.name === "territoryName"));
					if ((fltr1.length !== 1) || (fltr2.length !== 1)) {
						rspn.message = "Missing player and/or game IDs";
					} else if (fltr3.length !== 1) {
						rspn.message = "Missing territory name";
					} else {
						rspn.successful = populate(obj, fltr2[0].value);
					}
					break;
				case consts.TROOP_PLACED:
					// NOTE - used during game setup, fired when an owned territory is clicked, and add 1 troop
				case consts.TROOP_ADDED:
					// NOTE - used during start of turns when adding troops to owned territories, fired when an owned territory is clicked, and add 1 troop
					fltr1 = payload.filter(d => (d.name === "playerToken"));
					fltr2 = payload.filter(d => (d.name === "gameToken"));
					fltr3 = payload.filter(d => (d.name === "territoryName"));
					if ((fltr1.length !== 1) || (fltr2.length !== 1)) {
						rspn.message = "[ADD] Missing player and/or game IDs";
					} else if (fltr3.length !== 1) {
						rspn.message = "[ADD] Missing territory name";
					} else {
						rspn.successful = populate(obj, fltr2[0].value); //token of the game in question
					}
					break;
				case consts.TROOP_DEPLOYED:
					// NOTE - TROOP_DEPLOYED is used to subtract currently available reinforcement of a player after troops added to a territory
					fltr1 = payload.filter(d => (d.name === "playerToken"));
					fltr2 = payload.filter(d => (d.name === "gameToken"));
					fltr3 = payload.filter(d => (d.name === "amount"));
					if ((fltr1.length !== 1) || (fltr2.length !== 1)) {
						rspn.message = "Missing player and/or game IDs";
					} else if ((fltr3.length !== 1) || isNaN(fltr3[0].value)) {
						rspn.message = "Missing number of troops";
					} else {
						rspn.successful = populate(obj, fltr1[0].value);
					}
					break;
				case consts.TERRITORY_ATTACKED:
					fltr1 = payload.filter(d => (d.name === "playerToken"));
					fltr2 = payload.filter(d => (d.name === "gameToken"));
					fltr3 = payload.filter(d => (d.name === "fromTerritory"));
					fltr4 = payload.filter(d => (d.name === "toTerritory"));
					fltr5 = payload.filter(d => (d.name === "attackerLoss"));
					fltr6 = payload.filter(d => (d.name === "defenderLoss"));
					if ((fltr1.length !== 1) || (fltr2.length !== 1) || (fltr3.length !== 1) || (fltr4.length !== 1)) {
						rspn.message = "[ATTACK] Missing player ID, game ID and from/to territory IDs";
					} else if ((fltr5.length !== 1) || isNaN(fltr5[0].value)) {
						rspn.message = "[ATTACK] Missing attacker casualties";
					} else if ((fltr6.length !== 1) || isNaN(fltr6[0].value)) {
						rspn.message = "[ATTACK] Missing defender casualties";
					} else {
						rspn.successful = populate(obj, fltr2[0].value); //token of the game in question
					}
					break;
				case consts.TERRITORY_CONQUERED:
					fltr1 = payload.filter(d => (d.name === "playerToken"));
					fltr2 = payload.filter(d => (d.name === "gameToken"));
					fltr3 = payload.filter(d => (d.name === "fromTerritory"));
					fltr4 = payload.filter(d => (d.name === "toTerritory"));
					fltr5 = payload.filter(d => (d.name === "defenderToken"));
					if ((fltr1.length !== 1) || (fltr2.length !== 1) || (fltr3.length !== 1) || (fltr4.length !== 1) || (fltr5.length !== 1)) {
						rspn.message = "[CONQUER] Missing player ID, game ID, from/to territory IDs, or defender's token";
					} else {
						rspn.successful = populate(obj, fltr2[0].value);
					}
					break;
				case consts.PLAYER_DEFEATED:
					fltr1 = payload.filter(d => (d.name === "playerToken"));
					fltr2 = payload.filter(d => (d.name === "gameToken"));
					fltr3 = payload.filter(d => (d.name === "defenderToken"));
					if ((fltr1.length !== 1) || (fltr2.length !== 1) || (fltr3.length !== 1)) {
						rspn.message = "[ATTACK] Missing player ID, game ID, and ID of the player under attack";
					} else {
						rspn.successful = populate(obj, fltr1[0].value);
					}
					break;
				case consts.FORTIFIED:
					fltr1 = payload.filter(d => (d.name === "playerToken"));
					fltr2 = payload.filter(d => (d.name === "gameToken"));
					fltr3 = payload.filter(d => (d.name === "fromTerritory"));
					fltr4 = payload.filter(d => (d.name === "toTerritory"));
					fltr5 = payload.filter(d => (d.name === "amount"));
					if ((fltr1.length !== 1) || (fltr2.length !== 1) || (fltr3.length !== 1) || (fltr4.length !== 1)) {
						rspn.message = "[FORTIFY] Missing player ID, game ID, and from/to territory IDs";
					} else if ((fltr5.length !== 1) || isNaN(fltr5[0].value)) {
						rspn.message = "[FORTIFY] Missing number of troops";
					} else {
						rspn.successful = populate(obj, fltr2[0].value);
					}
					break;
				case consts.CARDS_REDEEMED:
					fltr1 = payload.filter(d => (d.name === "playerToken"));
					fltr2 = payload.filter(d => (d.name === "gameToken"));
					fltr3 = payload.filter(d => (d.name === "card1"));
					fltr4 = payload.filter(d => (d.name === "card2"));
					fltr5 = payload.filter(d => (d.name === "card3"));
					if ((fltr1.length !== 1) || (fltr2.length !== 1) || (fltr3.length !== 1) || (fltr4.length !== 1) || (fltr5.length !== 1)) {
						rspn.message = "[REDEEM] Missing player ID, game ID, and IDs of the cards being redeemed";
					} else {
						rspn.successful = populate(obj, fltr2[0].value);
					}
					break;
				case consts.GAME_WON:
					fltr1 = payload.filter(d => (d.name === "playerToken"));
					fltr2 = payload.filter(d => (d.name === "gameToken"));
					if ((fltr1.length !== 1) || (fltr2.length !== 1)) {
						rspn.message = "[WON] Missing player and/or game IDs";
					} else {
						rspn.successful = populate(obj, fltr2[0].value);
					}
					break;
			}
			if (rspn.successful) {
				const len = this.events.push(obj);
				if (len > 0) {
					rspn.event = copy(obj);
					resolve(rspn);
				} else {
					throw new UserInputError(`Adding event ${JSON.stringify(obj)} failed`);
				}
			} else {
				throw new UserInputError(rspn.message);
			}
		});
	}
};

module.exports = EventStore;