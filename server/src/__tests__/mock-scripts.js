module.exports = Object.freeze({
	SETUP_PLAYERS: ['Rick', 'John', 'Josh', 'Nick', 'Rick', 'Paul', 'Bill', 'Fred', 'Jack'],
	SETUP_GAMES: [
		{ name: "John's Game", index: 'John' },
		{ name: "Paul's Game", index: 'Paul' },
		{ name: "John's Game", index: 'Rick' },
		{ name: "Some game", index: 'John'}
	],
	SETUP_JOIN: ['Rick', 'John', 'Josh', 'Nick', 'Bill', 'Fred', 'Jack'],
	SETUP_TROOPS: {
		'Rick': {index: 0, majors: ['Mexico', 'New-Guinea']},
		'John': {index: 0, majors: ['Siberia', 'Ural', 'Alberta']},
		'Josh': {index: 0, majors: ['Congo', 'South-Africa']},
		'Nick': {index: 0, majors: ['Great-Britain', 'Northern-Europe', 'Ukraine']},
		'Paul': {index: 0, majors: ['Venezuela']}
	},
	GAME_SCRIPT: [
		{p:'Paul', r:{xpt:5, name:'Brazil', amt:6}, a:{xpt:9, lst:[{from:'Venezuela', to:'Mexico'}, {to:'Mexico', repeat:8}]}, f:{from:'Mexico', to:'Venezuela', amt:7}, x:8},
		{p:'Rick', r:{xpt:3, name:'New-Guinea', amt:12}, a:{xpt:11, lst:[{from:'New-Guinea', to:'Eastern-Australia'}, {to:'Western-Australia'}, {to:'Indonesia'}]}, x:6},
		{p:'John', r:{xpt:3, name:'Alberta', amt:9}, a:{xpt:10, lst:[{from:'Alberta', to:'Alaska'}, {to:'Kamchatka'}]}, x:5},
		{p:'Josh', r:{xpt:3, name:'South-Africa', amt:12}, a:{xpt:11, lst:[{from:'South-Africa', to:'Madagascar'}, {to:'East-Africa'}, {from:'Congo', to:'North-Africa'}, {to:'Egypt'}]}, x:6},
		{p:'Nick', r:{xpt:3, name:'Ukraine', amt:9}, a:{xpt:9, lst:[{from:'Ukraine', to:'Southern-Europe'}, {to:'Western-Europe'}, {from:'Northern-Europe', to:'Scandinavia'}, {from:'Great-Britain', to:'Iceland'}]}, f:{from:'Western-Europe', to:'Southern-Europe', amt:4}, x:5},
		{p:'Paul', r:{xpt:5, name:'Mexico', amt:6}, a:{xpt:9, lst:[{from:'Mexico', to:'Western-United-States'}, {to:'Eastern-United-States'}]}, f:{from:'Venezuela', to:'Mexico', amt:7}, x:8},
		{p:'Rick', r:{xpt:5, name:'Indonesia', amt:11}, a:{xpt:6, lst:[{from:'Indonesia', to:'Siam'}]}, x:9},
		{p:'John', r:{xpt:3, name:'Ural', amt:9}, a:{xpt:11, lst:[{from:'Ural', to:'Ukraine'}]}, x:7},
		{p:'Josh', r:{xpt:6, name:'North-Africa', amt:7}, a:{xpt:10, lst:[{from:'East-Africa', to:'Middle-East'}]}, x:6},
		{p:'Nick', r:{xpt:3, name:'Scandinavia', amt:8}, a:{xpt:9, lst:[{from:'Scandinavia', to:'Ukraine'}, {to:'Ukraine', repeat:6},{from:'Iceland', to:'Greenland'}]}, f:{from:'Greenland', to:'Iceland', amt:2}, x:3},
		{
			p:'Paul',
			r:{xpt:5, name:'Eastern-United-States', amt:7},
			a:{xpt:8, lst:[
				{from:'Eastern-United-States', to:'Quebec'}
			]}, f:{from:'Mexico', to:'Western-United-States', amt:7},
			x:8
		},
	]
});