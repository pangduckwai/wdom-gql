import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import { QUIT_PLAYER, CLOSE_GAME, LEAVE_GAME } from '../mutations';

export default function Greetings(props) {
	const resolve = () => {
		if (!props.gameToken) {
			return [QUIT_PLAYER, {
				onCompleted(data) {
					if (data.quitPlayer.successful) {
						sessionStorage.setItem("token", null);
						props.setPlayer(null);
					}
				}
			}];
		} else if (props.gameHost === props.player.token) {
			return [CLOSE_GAME, {
				onCompleted(data) {
					if (data.closeGame.successful) {
						sessionStorage.setItem("gameToken", null);
						props.refresh({ game: true });
					}
				}
			}];
		} else {
			return [LEAVE_GAME, {
				onCompleted(data) {
					if (data.leaveGame.successful) {
						sessionStorage.setItem("gameToken", null);
						props.refresh({ game: true });
					}
				}
			}];
		}
	};

	const [mut, onc] = resolve();
	const [action, { loading, error }] = useMutation(mut, onc);
	const handleSubmit = (e) => {
		e.preventDefault();
		action().then(r => {
			props.refetch();
		});
	};

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}
	if (loading) return <div id="greeting" className="title">Loading....</div>;
	return (
		<form id="greeting" onSubmit={handleSubmit}>
			<label className="title">Hello <span className="name">{props.player.name}</span></label>
			<input type="submit" value="&times;" />
		</form>
	);
}
