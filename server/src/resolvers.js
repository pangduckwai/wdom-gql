const { minPlayersPerGame, maxPlayersPerGame, shuffleCards, initialArmies } = require('./data/rules');

module.exports = {
	Query: {
		me: async (_, __, { dataSources }) => dataSources.playerDS.me(),
		players: async (_, __, { dataSources }) => dataSources.playerDS.listAll(),
		player: async (_, { token }, { dataSources }) => dataSources.playerDS.find({ token }),
		playersInGame: async (_, { id }, { dataSources }) => dataSources.playerDS.list({ id }),
		games: async (_, __, { dataSources }) => dataSources.gameDS.list(),
		game: async (_, { id }, { dataSources }) => {
			const games = await dataSources.gameDS.find({ id });
			if (games.length > 0)
				return games[0];
			else
				return null;
		},
		gameByHost: async (_, __, { dataSources }) => {
			const games = await dataSources.gameDS.findByHost();
			if (games.length > 0)
				return games[0];
			else
				return null;
		},
		holdings: async (_, __, { dataSources }) => {
			const me = await dataSources.playerDS.me();
			if (me) {
				if ((typeof(me.gid) !== "undefined") && (me.gid !== null)) {
					const games = await dataSources.gameDS.find({ id: me.gid });
					if (games.length > 0) {
						if (games[0].rounds >= 0) {
							return games[0].territories.filter(t => t.ptkn && (t.ptkn === me.token));
						} else
							console.log(`Game '${games[0].name}' not yet started`);
					}
				} else
					console.log(`Player '${me.name}' has not join any game yet`);
			}
			return [];
		}
	},
	Mutation: {
		register: async (_, { name }, { dataSources }) => {
			const player = await dataSources.playerDS.create({ name });
			if (player) return player;
		},
		leave: async (_, __, { dataSources }) => {
			const player = await dataSources.playerDS.remove();
			if (player) return player;
		},
		start: async (_, { name }, { dataSources }) => {
			const game = await dataSources.gameDS.create({ name });
			if (game) {
				const player = await dataSources.playerDS.join({ id: game.id });
				if (player) {
					const games = await dataSources.gameDS.find({ id: game.id });
					if (games.length > 0) return games[0];
				}
			}
			return null;
		},
		end: async(_, __, { dataSources }) => {
			const games = await dataSources.gameDS.findByHost();
			if (games.length > 0) {
				const ret = await dataSources.gameDS.remove({ id: games[0].id });
				if (ret) {
					const players = await dataSources.playerDS.cleanup({ id: games[0].id });
					return players;
				}
			}
			return null;
		},
		begin: async(_, __, { dataSources }) => {
			const games = await dataSources.gameDS.findByHost();
			if (games.length > 0) {
				const players = await dataSources.playerDS.list({ id: games[0].id });
				const len = players.length;
				if (len >= minPlayersPerGame()) {
					const deck = shuffleCards(players.map(p => p.token));
					const game = await dataSources.gameDS.begin({ id: games[0].id, deck: deck });
					if (game) {
						let q;
						let count = 0;
						for (let p of players) {
							let holdings = game.territories.filter(t => t.ptkn && (t.ptkn === p.token));
							q = await dataSources.playerDS.assignReinforcement({ token: p.token, reinforcement: initialArmies(len) - holdings.length });
							if (q) count ++;
						}
						if (count === len) {
							return game;
						}
					}
				} else
					console.log(`Need at least ${minPlayersPerGame()} players to start a game`);
			}
			return null;
		},
		join: async (_, { id }, { dataSources }) => {
			const games = await dataSources.gameDS.find({ id });
			const players = await dataSources.playerDS.list({ id });
			if (games.length > 0) {
				if (games[0].rounds < 0) {
					if (players.length < maxPlayersPerGame()) {
						const player = await dataSources.playerDS.join({ id: games[0].id });
						if (player) return player;
					} else
						console.log(`Max players reached for game '${games[0].name}'`);
				} else
					console.log(`Game '${games[0].name}' started already.`);
			}
			return null;
		},
		quit: async (_, __, { dataSources }) => {
			const games = await dataSources.gameDS.findByHost();
			if (games.length <= 0) { // cannot quit from your own game...
				const m = await dataSources.playerDS.me();
				if (m && (typeof(m.gid) !== "undefined") && (m.gid !== null)) {
					const gid = m.gid;
					const p = await dataSources.playerDS.join({ id: null });
					if (p) {
						const rets = await dataSources.gameDS.find({ id: gid });
						if (rets.length > 0) return p;
					}
				}
			}
			return null;
		}
		// test1: async (_, { territory }, { dataSources }) => {
		// 	const player = await dataSources.playerDS.me();
		// 	if (player && (typeof(player.gid) !== "undefined") && (player.gid !== null)) {
		// 		const game = await dataSources.gameDS.conquer({ id: player.gid, name: territory });
		// 		return game ? game : null;
		// 	}
		// }
	},
	Player: {
		joined: async (player, _, { dataSources }) => {
			const gid = await dataSources.playerDS.findJoined({ token: player.token });
			if ((typeof(gid) !== "undefined") && (gid !== null)) {
				const games = await dataSources.gameDS.find({ id: gid });
				if (games.length > 0) return games[0];
			}
			return null;
		}
	},
	Game: {
		host: async (game, _, { dataSources }) => {
			const token = await dataSources.gameDS.findHost({ id: game.id });
			if (token)
				return dataSources.playerDS.find({ token: token });
			else
				return null;
		}
	},
	Territory: {
		owner: async (territory, _, { dataSources }) => {
			const token = await dataSources.gameDS.findOwner({ id: territory.gid, name: territory.name });
			if (token)
				return dataSources.playerDS.find({ token: token });
			else
				return null;
		}
	}
};