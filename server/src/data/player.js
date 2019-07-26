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

	async me() {
		if (this.context && this.context.player) {
			const token = this.context.player.token;
			const player = await this.store.find({ token });
			return player ? player : null;
		}
		return null;
	}

	async findByName({ name }) {
		const player = await this.store.findByName({ name });
		return player ? player : null;
	}

	async findJoined({ token }) {
		const player = await this.store.find({ token });
		return ((typeof(player.gid) !== "undefined") && (player.gid >= 0)) ? player.gid : null;
	}

	async create({ name }) {
		const player = await this.store.create({ name });
		return player ? player : null;
	}

	async update({ id }) {
		if (this.context && this.context.player) {
			const token = this.context.player.token;
			const player = await this.store.update({ token, id });
			return player ? player : null;
		}
		return null;
	}

	async remove({ token }) {
		const player = await this.store.remove({ token });
		return player ? player : null;
	}

	async cleanup({ id }) {
		const players = await this.store.list({ id });
		let q;
		let ret = 0;
		for (let p of players) {
			q = await this.store.update({ token: p.token });
			if (q) ret ++;
		}
		return (players.length === ret) ? players : null;
	}
}

module.exports = PlayerDS;