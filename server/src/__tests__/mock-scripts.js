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
		{p:'Paul', r:{lst:[{name:'Brazil', amt:5}]}, a:{xpt:9, lst:[{from:'Venezuela', to:'Mexico'}, {to:'Mexico', repeat:8}]}, f:{from:'Mexico', to:'Venezuela', amt:7}, x:8},
		{p:'Rick', r:{lst:[{name:'New-Guinea', amt:3}]}, a:{xpt:11, lst:[{from:'New-Guinea', to:'Eastern-Australia'}, {to:'Western-Australia'}, {to:'Indonesia'}]}, x:6},
		{p:'John', r:{lst:[{name:'Alberta', amt:3}]}, a:{xpt:10, lst:[{from:'Alberta', to:'Alaska'}, {to:'Kamchatka'}]}, x:5},
		{p:'Josh', r:{lst:[{name:'South-Africa', amt:3}]}, a:{xpt:11, lst:[{from:'South-Africa', to:'Madagascar'}, {to:'East-Africa'}, {from:'Congo', to:'North-Africa'}, {to:'Egypt'}]}, x:6},
		{p:'Nick', r:{lst:[{name:'Ukraine', amt:3}]}, a:{xpt:9, lst:[{from:'Ukraine', to:'Southern-Europe'}, {to:'Western-Europe'}, {from:'Northern-Europe', to:'Scandinavia'}, {from:'Great-Britain', to:'Iceland'}]}, f:{from:'Western-Europe', to:'Southern-Europe', amt:4}, x:5},
		{p:'Paul', r:{lst:[{name:'Mexico', amt:5}]}, a:{xpt:9, lst:[{from:'Mexico', to:'Western-United-States'}, {to:'Eastern-United-States'}]}, f:{from:'Venezuela', to:'Mexico', amt:7}, x:8},
		{p:'Rick', r:{lst:[{name:'Indonesia', amt:5}]}, a:{xpt:6, lst:[{from:'Indonesia', to:'Siam'}]}, x:9},
		{p:'John', r:{lst:[{name:'Ural', amt:3}]}, a:{xpt:11, lst:[{from:'Ural', to:'Ukraine'}]}, x:7},
		{p:'Josh', r:{lst:[{name:'North-Africa', amt:6}]}, a:{xpt:10, lst:[{from:'East-Africa', to:'Middle-East'}]}, x:6},
		{p:'Nick', r:{lst:[{name:'Scandinavia', amt:3}]}, a:{xpt:9, lst:[{from:'Scandinavia', to:'Ukraine'}, {to:'Ukraine', repeat:6},{from:'Iceland', to:'Greenland'}]}, f:{from:'Greenland', to:'Iceland', amt:2}, x:3},
		{p:'Paul', r:{lst:[{name:'Eastern-United-States', amt:5}]}, a:{xpt:8, lst:[{from:'Eastern-United-States', to:'Quebec'}]}, f:{from:'Mexico', to:'Western-United-States', amt:7}, x:8},
		{p:'Rick', r:{lst:[{name:'Siam', amt:5}]}, a:{xpt:7, lst:[{from:'Siam', to:'China'}, { to: 'India' }]}, f:{from:'India', to:'Siam', amt:10}, x:10},
		{p:'John', r:{lst:[{name:'Siberia', amt:3}]}, a:{xpt:10, lst:[{from:'Siberia', to:'Irkutsk'}]}, f:{from:'Irkutsk', to:'Siberia', amt:9}, x:8},
		{p:'Josh', r:{lst:[{name:'Egypt', amt:6}]}, a:{xpt:9, lst:[{from:'Egypt', to:'Southern-Europe'}, {to: 'Southern-Europe', repeat: 4}]}, f:{from:'North-Africa', to:'Southern-Europe', amt:2}, x:8},
		{p:'Nick', r:{lst:[{name:'Northern-Europe', amt:3}]}, a:{xpt:9, lst:[{from:'Northern-Europe', to:'Ukraine'}]}, x:2},
		{p:'Paul', r:{lst:[{name:'Quebec', amt:5}]}, a:{xpt:10, lst:[{from:'Western-United-States', to:'Alberta'}, {from:'Quebec', to:'Ontario'}]}, x: 8},
		{p:'Rick', r:{lst:[{name:'India', amt:5}]}, a:{xpt:8, lst:[{from:'India', to:'Afghanistan'}]}, f:{from:'Siam', to:'China', amt:9}, x: 10},
		{p:'John', r:{lst:[{name:'Siberia', amt:3}]}, a:{xpt:8, lst:[{from:'Siberia', to:'Yakutsk'}]}, f:{from:'Yakutsk', to:'Siberia', amt:8}, x: 9},
		{p:'Josh', r:{lst:[{name:'Southern-Europe', amt:6}]}, a:{xpt:16, lst:[{from:'North-Africa', to:'Western-Europe'}, {to:'Northern-Europe'},{from:'Southern-Europe', to:'Ukraine', repeat:2}, {to:'Scandinavia'}, {to:'Great-Britain'}, {to:'Iceland', repeat:3}, {to:'Greenland'}]}, f:{from:'Middle-East', to:'Egypt', amt:5}, x:6},
		{p:'Paul', r:{lst:[{name:'Alberta', amt:3}, {name:'Ontario', amt:1}, {name:'Brazil', amt:1}]}, a:{xpt:14, lst:[{from:'Alberta', to:'Northwest-Territory'}, {to:'Alaska'},{from:'Ontario', to:'Greenland'}, {to:'Iceland'}]}, x:5},
		{p:'Rick', r:{lst:[{name:'Afghanistan', amt:5}]}, a:{xpt:10, lst:[{from:'Afghanistan', to:'Middle-East'}, {from:'China', to:'Manchuria'}]}, f:{from:'Middle-East', to:'Afghanistan', amt:6}, x:7},
		{p:'John', r:{lst:[{name:'Ural', amt:3}]}, a:{xpt:7, lst:[{from:'Ural', to:'China'}]}, f:{from:'China', to:'Irkutsk', amt:1}, x:2},
		{p:'Josh', c:[["Western-Europe","Manchuria","China"]], r:{lst:[{name:'North-Africa', amt:6}, {name:'Egypt', amt:5}]}, a:{xpt:13, lst:[{from:'Egypt', to:'Middle-East'}]}, x:9},
		{p:'Paul', c:[["Venezuela","Eastern-United-States","Ural"]], r:{lst:[{name:'Iceland', amt:3}, {name:'Alaska', amt:3}, {name:'Brazil', amt:11}]}, a:{xpt:15, lst:[{from:'Brazil', to:'North-Africa'}, {to:'North-Africa', repeat:6}]}, f:{from:'Venezuela', to:'Brazil', amt:2}, x:3},
		{p:'Rick', c:[["India","Great-Britain","Congo"]], r:{lst:[{name:'Manchuria', amt:13}]}, a:{xpt:9, lst:[{from:'Manchuria', to:'Siberia'}, {to:'Siberia', repeat:8}]}, f:{from:'India', to:'Afghanistan', amt:2}, x:9},
		{p:'John', c:[["Irkutsk","Egypt","Indonesia"]], r:{lst:[{name:'Kamchatka', amt:13}]}, a:{xpt:8, lst:[{from:'Irkutsk', to:'Siberia'}, {to:'Siberia', repeat:3}, {from:'Kamchatka', to:'Manchuria'}, {to:'Siberia', repeat:8}]}, f:{from:'Siberia', to:'Manchuria', amt:6}, x:7},
		{p:'Josh', c:[["South-Africa","Peru","Siberia"]], r:{lst:[{name:'Western-Europe', amt:19}]}, a:{xpt:14, lst:[{from:'Western-Europe', to:'North-Africa'}, {to:'North-Africa', repeat:9}, {to:'Brazil', repeat:3}]}, f:{from:'South-Africa', to:'East-Africa', amt:2}, x:3},
		{
			p:'Paul', c:[["Northern-Europe","Scandinavia","Western-Australia"]], r:{lst:[{name:'Venezuela', amt:29}]}, a:{xpt:15, lst:[
				{from:'Venezuela', to:'Brazil'}, {to:'Brazil', repeat:6}, {to:'North-Africa'}
			]}, x:20
		},
		{p:'Rick', r:{lst:[{name:'Afghanistan', amt:5}]}, a:{xpt:8, lst:[{from:'Afghanistan', to:'China'}]}, f:{from:'China', to:'Siam', amt:12}, x:12},
	]
});