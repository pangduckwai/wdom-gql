import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import { QUIT_PLAYER, CLOSE_GAME, LEAVE_GAME } from '../mutations';
import GreetingsComp from './greetings-comp';

export default function Greetings(props) {
	if (props.player && !props.player.joined) {
		const [quitPlayer, { loading, error }] = useMutation(QUIT_PLAYER, {
			onCompleted(data) {
				if (data.quitPlayer.successful) {
					sessionStorage.setItem("token", "");
				}
			}
		});

		if (loading) return <p>Loading...</p>;
		if (error) {
			console.log(JSON.stringify(error));
			return <p>ERROR</p>;
		}
		return (
			<GreetingsComp
				player={props.player}
				action={quitPlayer}
				desc="Quit"
				refetch={props.refetch} />
		);
	} else if (props.player && (props.player.joined.host.token === props.player.token)) {
		const [closeGame, { loading, error }] = useMutation(CLOSE_GAME, {
			onCompleted(data) {
				if (data.closeGame.successful) {
					sessionStorage.setItem("gameToken", "");
				}
			}
		});

		if (loading) return <p>Loading...</p>;
		if (error) {
			console.log(JSON.stringify(error));
			return <p>ERROR</p>;
		}
		return (
			<GreetingsComp
				player={props.player}
				action={closeGame}
				desc="Close"
				refetch={props.refetch} />
		);
	} else {
		const [leaveGame, { loading, error }] = useMutation(LEAVE_GAME, {
			onCompleted(data) {
				if (data.leaveGame.successful) {
					sessionStorage.setItem("gameToken", "");
				}
			}
		});

		if (loading) return <p>Loading...</p>;
		if (error) {
			console.log(JSON.stringify(error));
			return <p>ERROR</p>;
		}
		return (
			<GreetingsComp
				player={props.player}
				action={leaveGame}
				desc="Leave"
				refetch={props.refetch} />
		);
	}
}
