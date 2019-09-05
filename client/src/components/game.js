import React from 'react';
import OpenGame from './game-open';

export default function Game(props) {
	if (!props.playerToken) return <span>&nbsp;</span>;

	return (
		<>
			{!(props.gameToken) ? (
				<OpenGame refetch={props.refetch} />
			) : (
				<div className="title bb mb">Game <span className="name">{props.gameName}</span></div>
			)}
		</>
	);
}
