const { DataSource } = require('apollo-datasource');

class PlayerDS extends DataSource {
	constructor({ store }) {
		super();
		this.store = store;
	}

	initialize(config) {
		this.context = config.context;
	}

	async listAll() {
		const players = await this.store.listAll();
		return players ? players : null;
	}

	async list({ id }) {
		const players = await this.store.list({ id });
		return players ? players : null;
	}

	async find({ token }) {
		const player = await this.store.find({ token });
		return player ? player : null;
	}

	async findByName({ name }) {
		const player = await this.store.findByName({ name });
		return player ? player : null;
	}

	async create({ name }) {
		const player = await this.store.create({ name });
		return player ? player : null;
	}

	async update(player) {
		const player = await this.store.update(player);
		return player ? player : null;
	}

	async remove({ token }) {
		const player = await this.store.remove({ token });
		return player ? player : null;
	}
}

module.exports = PlayerDS;