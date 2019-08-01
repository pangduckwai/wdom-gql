const { DataSource } = require('apollo-datasource');
const evn = require('../constants');

class Commands extends DataSource {
	constructor({ store }) {
		super();
		this.store = store;
	}

	initialize(config) {
		this.context = config.context;
	}

	async registerPlayer({ name }) {
		// TODO check player name not yet exists first!!!!!!!!!
		return this.store.add({
			event: evn.PLAYER_REGISTERED,
			payload: { name: name } 
		});
	}
}

module.exports = Commands;