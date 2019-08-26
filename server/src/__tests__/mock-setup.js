const evn = require('../consts');

module.exports.mockSetup = async ({ eventDS }) => {
	let ptokens = [];
	await eventDS.add({ event: evn.PLAYER_REGISTERED, payload: [{ name: "playerName", value: "Eric" }]}).then(r => ptokens.push(r.event.token));
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.PLAYER_REGISTERED, payload: [{ name: "playerName", value: 'Pete' }]}).then(r => ptokens.push(r.event.token));
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.PLAYER_REGISTERED, payload: [{ name: "playerName", value: 'Bill' }]}).then(r => ptokens.push(r.event.token));
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.PLAYER_REGISTERED, payload: [{ name: "playerName", value: 'Jess' }]}).then(r => ptokens.push(r.event.token));
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.PLAYER_REGISTERED, payload: [{ name: "playerName", value: 'Dave' }]}).then(r => ptokens.push(r.event.token));
	await eventDS.updateSnapshot();

	let gtokens = [];
	await eventDS.add({ event: evn.GAME_OPENED, payload: [{ name: "playerToken", value: ptokens[0] }, { name: "gameName", value: "Eric's Game" }]}).then(r => gtokens.push(r.event.token));
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.GAME_JOINED, payload: [{ name: "playerToken", value: ptokens[0] }, { name: "gameToken", value: gtokens[0] }]});
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.GAME_OPENED, payload: [{ name: "playerToken", value: ptokens[1] }, { name: "gameName", value: "Pete's Game" }]}).then(r => gtokens.push(r.event.token));
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.GAME_JOINED, payload: [{ name: "playerToken", value: ptokens[1] }, { name: "gameToken", value: gtokens[1] }]});
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.GAME_OPENED, payload: [{ name: "playerToken", value: ptokens[2] }, { name: "gameName", value: "Bill's Game" }]}).then(r => gtokens.push(r.event.token));
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.GAME_JOINED, payload: [{ name: "playerToken", value: ptokens[2] }, { name: "gameToken", value: gtokens[2] }]});
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.GAME_OPENED, payload: [{ name: "playerToken", value: ptokens[3] }, { name: "gameName", value: "Jess's Game" }]}).then(r => gtokens.push(r.event.token));
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.GAME_JOINED, payload: [{ name: "playerToken", value: ptokens[3] }, { name: "gameToken", value: gtokens[3] }]});
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.GAME_OPENED, payload: [{ name: "playerToken", value: ptokens[4] }, { name: "gameName", value: "Dave's Game" }]}).then(r => gtokens.push(r.event.token));
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.GAME_JOINED, payload: [{ name: "playerToken", value: ptokens[4] }, { name: "gameToken", value: gtokens[4] }]});
	await eventDS.updateSnapshot();

	// await eventDS.add({ event: evn.GAME_JOINED, payload: { data: [ptokens[2], gtokens[1]] }});
	// await eventDS.updateSnapshot();
	// await eventDS.add({ event: evn.GAME_JOINED, payload: { data: [ptokens[3], gtokens[1]] }});
	// await eventDS.updateSnapshot();
	// await eventDS.add({ event: evn.GAME_JOINED, payload: { data: [ptokens[4], gtokens[1]] }});
	// await eventDS.updateSnapshot();
};

/* For playground
query Games {
	listGames {
		token
		name
		host {
			name
		}
	}
}

query Players {
	listPlayers {
    token
		name
    joined {
      name
    }
	}
}

query Myself {
  me {
    token
    name
    joined {
      name
    }
  }
}
{
  "authorization": "hQeuhr6j2zyb4qt30/fW10UQookAPudiKfSR9k5La/Y="
}
*/