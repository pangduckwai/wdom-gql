const { DataSource } = require('apollo-datasource');

class PlayerDS extends DataSource {
	constructor({ store }) {
		super();
		this.store = store;
	}

	initialize(config) {
		this.context = config.context;
	}

	async find({ token }) {
		const player = await this.store.find({ token });
		return player ? player : null;
	}

	async join({ name }) {
		const player = await this.store.join({ name });
		return player ? player : null;
	}

	async leave({ token }) {
		const player = await this.store.leave({ token });
		return player ? player : null;
	}
}

module.exports = PlayerDS;