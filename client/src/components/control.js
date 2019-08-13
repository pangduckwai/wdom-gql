import React from 'react';
import './map.css';

export default function Control(props) {
	if (!props.player.token) {
		return (
			<div className="control">
				<form onSubmit={props.onSubmit}>
					<label>Your name
						<input type="text" value={props.playerName} onChange={props.onChange} />
					</label>
					<input type="submit" value="Register player" />
				</form>
			</div>
		);
	} else if (!props.game.token) {
		return (
			<div className="control">
				Join a game / Create a new game
			</div>
		);
	} else {
		return (
			<div className="control">
				Play game
			</div>
		);
	}
}
