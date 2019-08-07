const { UserInputError } = require('apollo-server');
const crypto = require('crypto');
const evn = require('../events');

/*
	type Event {
		eventid: String!
		timestamp: Int!
		event: String! (Register(P)|Quit(P)|Join(G)|Leave(G)|Next(G)|Open(H)|Close(H)|Start(H)|Assign(T)|Add(T)|Attack(T)|Fortify(T)|Collect(C)|Redeem(C))
		token: String! (token of related entities (Player/Game/etc.))
		type: String! (Player|Game|Card|...)
		name: String
		amount: Int
		tokens: [String]
	}
*/
let copy = (orig) => {
	let copy = {};
	copy.eventid = orig.eventid;
	copy.timestamp = orig.timestamp;
	copy.event = orig.event;
	copy.token = orig.token;
	copy.type = orig.type;
	if (typeof(orig.name) !== "undefined") copy.name = orig.name;
	if (typeof(orig.amount) !== "undefined") copy.amount = orig.amount;
	if (orig.tokens) {
		copy.tokens = [];
		for (let t of orig.tokens)
			copy.tokens.push(t);
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
	}

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

	// Adding events (these are not commands)
	add({ event, payload = {
		name: null,
		amount: -1,
		tokens: []
	}}) {
		return new Promise((resolve, reject) => {
			let dtm = Date.now();
			let eid = crypto.createHash('sha256').update('' + (dtm + Math.floor(Math.random()*10000))).digest('base64');
			let obj = {
				eventid: eid,
				timestamp: dtm,
				event: event.id,
				type: event.type
			};
			let rspn = { successful: false };

			if (payload.name !== null) obj.name = payload.name;
			if (payload.amount >= 0) obj.amount = payload.amount;
			if (payload.tokens && (payload.tokens.length > 0)) {
				obj.tokens = [];
				for (let t of payload.tokens)
					obj.tokens.push(t);
			}

			switch (event.id) {
				case evn.PLAYER_REGISTERED.id:
					if (payload.name === null) {
						rspn.message = "[REGISTER] Missing player name";
					} else {
						rspn.successful = populate(obj, eid); //event id is also the token of the player
					}
					break;
				case evn.PLAYER_QUITTED.id:
					if (payload.tokens.length < 1) {
						rspn.message = "[QUIT] Missing player ID";
					} else {
						rspn.successful = populate(obj, payload.tokens[0]); //token of the player quitting
					}
					break;
				case evn.GAME_JOINED.id:
				case evn.GAME_LEFT.id:
					if (payload.tokens.length < 2) {
						rspn.message = "Missing player and/or game IDs";
					} else {
						rspn.successful = populate(obj, payload.tokens[0]);
					}
					break;
				case evn.GAME_OPENED.id:
					if (payload.tokens.length < 1) {
						rspn.message = "[OPEN] Missing player ID";
					} else if (payload.name === null) {
						rspn.message = "[OPEN] Missing game name";
					} else {
						rspn.successful = populate(obj, eid); //event id is also the token of the game
					}
					break;
				case evn.GAME_CLOSED.id:
				case evn.GAME_STARTED.id:
				case evn.ACTION_TAKEN.id:
				case evn.TURN_TAKEN.id:
				case evn.SETUP_FINISHED.id:
					if (payload.tokens.length < 2) {
						rspn.message = "Missing player and/or game IDs";
					} else {
						rspn.successful = populate(obj, payload.tokens[1]);
					}
					break;
				case evn.TERRITORY_ASSIGNED.id:
				case evn.TERRITORY_SELECTED.id:
				case evn.CARD_RETURNED.id:
					if (payload.tokens.length < 2) {
						rspn.message = "Missing player and/or game IDs";
					} else if (payload.name === null) {
						rspn.message = "Missing territory name";
					} else {
						rspn.successful = populate(obj, payload.tokens[1]);
					}
					break;
				case evn.TROOP_ADDED.id:
					// NOTE - used for both during game setup, and start of turns when adding troops to owned territories
					//      - usually correspond to a click to a territory, meaning to add 1 troop.
					//      - exception: when redeeming cards, if any of the territory on the cards are owned by the same player,
					//        add 2 troops directly to that territory
					if (payload.tokens.length < 2) {
						rspn.message = "[ADD] Missing player and/or game IDs";
					} else if (payload.name === null) {
						rspn.message = "[ADD] Missing territory name";
					} else if (payload.amount < 0) {
						rspn.message = "[ADD] Missing number of troops";
					} else {
						rspn.successful = populate(obj, payload.tokens[1]); //token of the game in question
					}
					break;
				case evn.TROOP_ASSIGNED.id:
					// TROOP_ASSIGNED: NOTE - use for assigning troops to a player at:
					//  1. during setup phase, assigning remaining troops after adding 1 troop to each owned territory
					//  2. at the begining of each turn when receiving reinforcement
					//  3. after redeem cards for additional reinforcement
				case evn.TROOP_DEPLOYED.id:
					// TROOP_DEPLOYED: NOTE - subtract currently available reinforcement of a player after troops added to a territory
					if (payload.tokens.length < 2) {
						rspn.message = "Missing player and/or game IDs";
					} else if (payload.amount < 0) {
						rspn.message = "Missing number of troops";
					} else {
						rspn.successful = populate(obj, payload.tokens[0]);
					}
					break;
				case evn.TERRITORY_ATTACKED.id:
					if (payload.tokens.length < 4) {
						rspn.message = "[ATTACK] Missing player ID, game ID, and from/to territory IDs";
					} else {
						rspn.successful = populate(obj, payload.tokens[1]); //token of the game in question
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