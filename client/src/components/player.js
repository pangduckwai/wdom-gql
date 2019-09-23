import React from 'react';
import Greetings from './player-greetings';
import GreetHost from './player-hosting';
import GreetJoiner from './player-joining';
import Register from './player-register';

export default function Player(props) {
	return (
		<>
			{(!props.playerToken) &&
				<Register refetch={props.refetch} />
			}
			{(props.playerToken && !props.gameToken) &&
				<Greetings
					refetch={props.refetch}
					playerName={props.playerName} />
			}
			{(props.playerToken && props.gameToken && (props.gameHost === props.playerToken) && (props.rounds <= 0)) &&
				<GreetHost
					refetch={props.refetch}
					playerName={props.playerName} />
			}
			{(props.playerToken && props.gameToken && ((props.gameHost !== props.playerToken) || (props.rounds > 0))) &&
				<GreetJoiner
					refetch={props.refetch}
					playerName={props.playerName} />
			}
		</>
	);
}
