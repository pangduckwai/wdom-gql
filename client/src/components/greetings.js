import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import { QUIT_PLAYER, CLOSE_GAME, LEAVE_GAME } from '../mutations';

export default function Greetings(props) {
	const resolve = () => {
		if (props.player && !props.player.joined) {
			return [QUIT_PLAYER, {
				onCompleted(data) {
					if (data.quitPlayer.successful) {
						sessionStorage.setItem("token", null);
					}
				}
			}];
		} else if (props.player && (props.player.joined.host.token === props.player.token)) {
			return [CLOSE_GAME, {
				onCompleted(data) {
					if (data.closeGame.successful) {
						sessionStorage.setItem("gameToken", null);
					}
				}
			}];
		} else {
			return [LEAVE_GAME, {
				onCompleted(data) {
					if (data.leaveGame.successful) {
						sessionStorage.setItem("gameToken", null);
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

	if (loading) return <p>'Greetings' Loading...</p>;
	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}
	return (
		<form id="greeting" onSubmit={handleSubmit}>
			<label className="title">Hello <span className="name">{props.player.name}</span></label>
			<input type="submit" value="&times;" />
		</form>
	);
}
