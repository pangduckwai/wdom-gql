const evn = require('../const-events');

module.exports.mockSetup = async ({ eventDS }) => {
	let ptokens = [];
	await eventDS.add({ event: evn.PLAYER_REGISTERED, payload: { name: 'Eric' }}).then(r => ptokens.push(r.event.token));
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.PLAYER_REGISTERED, payload: { name: 'Pete' }}).then(r => ptokens.push(r.event.token));
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.PLAYER_REGISTERED, payload: { name: 'Bill' }}).then(r => ptokens.push(r.event.token));
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.PLAYER_REGISTERED, payload: { name: 'Jess' }}).then(r => ptokens.push(r.event.token));
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.PLAYER_REGISTERED, payload: { name: 'Dave' }}).then(r => ptokens.push(r.event.token));
	await eventDS.updateSnapshot();

	let gtokens = [];
	await eventDS.add({ event: evn.GAME_OPENED, payload: { name: "Eric's Game", data: [ ptokens[0] ]}}).then(r => gtokens.push(r.event.token));
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.GAME_JOINED, payload: { data: [ptokens[0], gtokens[0]] }});
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.GAME_OPENED, payload: { name: "Pete's Game", data: [ ptokens[1] ]}}).then(r => gtokens.push(r.event.token));
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.GAME_JOINED, payload: { data: [ptokens[1], gtokens[1]] }});
	await eventDS.updateSnapshot();

	await eventDS.add({ event: evn.GAME_OPENED, payload: { name: "Bill's Game", data: [ ptokens[2] ]}}).then(r => gtokens.push(r.event.token));
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.GAME_JOINED, payload: { data: [ptokens[2], gtokens[2]] }});
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.GAME_OPENED, payload: { name: "Jess's Game", data: [ ptokens[3] ]}}).then(r => gtokens.push(r.event.token));
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.GAME_JOINED, payload: { data: [ptokens[3], gtokens[3]] }});
	await eventDS.updateSnapshot();
	// await eventDS.add({ event: evn.GAME_OPENED, payload: { name: "Dave's Game", data: [ ptokens[4] ]}}).then(r => gtokens.push(r.event.token));
	// await eventDS.updateSnapshot();
	// await eventDS.add({ event: evn.GAME_JOINED, payload: { data: [ptokens[4], gtokens[4]] }});
	// await eventDS.updateSnapshot();

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