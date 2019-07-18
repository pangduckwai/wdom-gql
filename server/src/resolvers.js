
module.exports = {
	Query: {
		me: (_, { token }, { dataSources }) => dataSources.playerDS.find({ token })
	},
	Mutation: {
		register: async (_, { name }, { dataSources }) => {
			const player = await dataSources.playerDS.register({ name });
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