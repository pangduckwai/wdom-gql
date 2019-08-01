const EventStore = require("./events");
const evn = require('../constants');

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
class Queries {
	constructor({ store }) {
        this.store = store;
        this.players = [];
        this.games = [];
        this.idxPlayerToken = {};
        this.idxGameToken = {};
	}

    rebuildPlayerIndex() {
		this.idxPlayerToken = {};
		for (let i = 0; i < this.players.length; i ++) {
			this.idxPlayerToken[this.players[i].token] = i;
		}
    };

    rebuildGameIndex() {
		this.idxGameToken = {};
		for (let j = 0; j < this.games.length; j ++) {
			this.idxGameToken[this.games[j].token] = j;
		}
    };

    listPlayers() {
        return this.players;
    };

    listGames() {
        return this.games;
    }

    async snapshot() {
        //Players
        const registered = await this.store.find({ type: "P", event: evn.PLAYER_REGISTERED.id });
        for (let player of registered) {
            let events = await this.store.find({ token: player.eventid });
            for (let v of events) {
                switch (v.event) {
                    case evn.PLAYER_REGISTERED.id:
                        let o1 = {
                            ready: true,
                            token: v.token,
                            name: v.name
                        };
                        let len = this.players.push(o1);
                        if (len > 0) {
                            this.rebuildPlayerIndex();
                        }
                        break;
                    case evn.PLAYER_QUITTED.id:
                        let o2 = this.players[this.idxPlayerToken[v.token]];
                        if (o2) {
                            this.players.splice(this.idxPlayerToken[v.token], 1);
                            this.rebuildPlayerIndex();
                        }
                        break;
                    case evn.TROOP_DEPLOYED.id:
                        let o3 = this.players[this.idxPlayerToken[v.token]];
                        if (o3) {
                            if (o3.reinforcement > v.amount) {
                                o3.reinforcement = o3.reinforcement - v.amount;
                            } else {
                                o3.ready = false;
                            }
                        }
                        break;
                }
            }
        }

        return true;
    }
};

module.exports = Queries;