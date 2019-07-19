
module.exports = {
	Query: {
		players: (_, __, { dataSources }) => dataSources.playerDS.listAll(),
		player: (_, { token }, { dataSources }) => dataSources.playerDS.find({ token }),
		me: (_, __, { dataSources }) => dataSources.playerDS.me(),
		games: async (_, __, { dataSources }) => dataSources.gameDS.list(),
		game: async (_, { id }, { dataSources }) => dataSources.gameDS.find({ id }),
		gameByHost: async (_, { token }, { dataSources }) => dataSources.gameDS.findByHost(token)
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
		create: async (_, { name }, { dataSources }) => {
			const game = await dataSources.gameDS.create({ name });
			if (game) return game;
		}
	},
	Player: {
		joined: async (player, _, { dataSources }) => {
			return dataSources.gameDS.find({ id: player.gid });
		}
	}
};