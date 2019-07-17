
module.exports = {
	Query: {
		me: (_, { token }, { dataSources }) => dataSources.playerDS.find({ token })
	},
	Mutation: {
		join: async (_, { name }, { dataSources }) => {
			const player = await dataSources.playerDS.join({ name });
			if (player)
				return player;
		},
		leave: async (_, { token }, { dataSources }) => {
			const player = await dataSources.playerDS.leave({ token });
			if (player)
				return player;
		}
	}
};