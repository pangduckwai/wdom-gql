
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
	},
	Mutation: {
		register: async (_, { name }, { dataSources }) => {
			const player = await dataSources.playerDS.create({ name });
			if (player) return player;
		},
		leave: async (_, { token }, { dataSources }) => {
			const player = await dataSources.playerDS.remove({ token });
			if (player) return player;
		},
		start: async (_, { name }, { dataSources }) => {
			const game = await dataSources.gameDS.create({ name });
			if (game) {
				const player = await dataSources.playerDS.update({ id: game.id });
				if (player) {
					const games = await dataSources.gameDS.find({ id: game.id });
					if (games.length > 0)
						return games[0];
					else
						return null;
				}
			}
		},
		end: async(_, __, { dataSources }) => {
			const games = await dataSources.gameDS.findByHost();
			if (games.length > 0) {
				const ret = await dataSources.gameDS.remove({ id: games[0].id });
				if (ret) {
					const players = await dataSources.playerDS.cleanup({ id: games[0].id });
					return players;
				} else
					return null;
			}
		},
		join: async (_, { id }, { dataSources }) => {
			const games = await dataSources.gameDS.find({ id });
			if (games.length > 0) {
				const player = await dataSources.playerDS.update({ id: games[0].id });
				if (player)
					return player;
				else
					return null;
			}
		},
		quit: async (_, __, { dataSources }) => {
			const games = await dataSources.gameDS.findByHost();
			if (games.length <= 0) { // cannot quit from your own game...
				const m = await dataSources.playerDS.me();
				if (m && (typeof(m.gid) !== "undefined") && (m.gid !== null)) {
					const gid = m.gid;
					const p = await dataSources.playerDS.update({ id: null });
					if (p) {
						const rets = await dataSources.gameDS.find({ id: gid });
						if (rets.length > 0)
							return p;
						else
							return null;
					}
				}
			}
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