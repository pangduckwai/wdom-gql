module.exports = Object.freeze({
	PLAYER_REGISTERED: {
		id: 1, type: "PB"
	}, PLAYER_QUITTED: {
		id: 2, type: "PB"
	}, GAME_JOINED: {
		id: 3, type: "GN"
	}, GAME_LEFT: {
		id: 4, type: "GN"
	}, GAME_OPENED: {
		id: 5, type: "GB"
	}, GAME_CLOSED: {
		id: 6, type: "GB"
	}, GAME_STARTED: {
		id: 7, type: "GN"
	}, TERRITORY_ASSIGNED: {
		id: 8, type: "TN"
	}, TROOP_PLACED: {
		id: 9, type: "TN"
	}, TROOP_ADDED: {
		id: 10, type: "TN"
	}, TROOP_DEPLOYED: {
		id: 11, type: "PN"
	}, TERRITORY_SELECTED: {
		id: 12, type: "GN"
	}, NEXT_PLAYER: {
		id: 13, type: "GN"
	}, SETUP_FINISHED: {
		id: 14, type: "GN"
	}, CARD_RETURNED: {
		id: 15, type: "GN"
	}, CARDS_REDEEMED: {
		id: 16, type: "GN"
	}, TERRITORY_ATTACKED: {
		id: 17, type: "GN"
	}, TERRITORY_CONQUERED: {
		id: 18, type: "GN"
	}, PLAYER_ATTACKED: {
		id: 19, type: "PN"
	}, FORTIFIED: {
		id: 20, type: "GN"
	}, TURN_ENDED: {
		id: 21, type: "GN"
	},

	BROADCAST_EVENT: {
		topic: "BROADCAST_EVENT"
	}, BROADCAST_GAME_EVENT: {
		topic: "BROADCAST_GAME_EVENT"
	}
});