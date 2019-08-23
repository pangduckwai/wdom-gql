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
	}, TROOP_ADDED: {
		id: 9, type: "TN"
	}, TROOP_DEPLOYED: {
		id: 10, type: "PN"
	}, TERRITORY_SELECTED: {
		id: 11, type: "GN"
	}, NEXT_PLAYER: {
		id: 12, type: "GN"
	}, SETUP_FINISHED: {
		id: 13, type: "GN"
	}, CARD_RETURNED: {
		id: 14, type: "GN"
	}, CARDS_REDEEMED: {
		id: 15, type: "GN"
	}, TERRITORY_ATTACKED: {
		id: 16, type: "GN"
	}, TERRITORY_CONQUERED: {
		id: 17, type: "GN"
	}, PLAYER_ATTACKED: {
		id: 18, type: "PN"
	}, FORTIFIED: {
		id: 19, type: "GN"
	}, TURN_ENDED: {
		id: 20, type: "GN"
	},

	BROADCAST_EVENT: {
		topic: "BROADCAST_EVENT"
	}, BROADCAST_GAME_EVENT: {
		topic: "BROADCAST_GAME_EVENT"
	}
});