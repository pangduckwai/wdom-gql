import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import { QUIT_PLAYER } from '../mutations';

export default function Greetings(props) {
	const [action, { loading, error }] = useMutation(QUIT_PLAYER, {
		onCompleted(data) {
			if (data.quitPlayer.successful) {
				sessionStorage.setItem("sessionid", null);
			}
		}
	});

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
	return (
		<form id="greeting" onSubmit={handleSubmit}>
			{!loading ? (
				<>
					<label className="title">Hello <span className="name">{props.playerName}</span></label>
					<input type="submit" value="&times;" />
				</>
			) : (
				<label className="title">Loading....</label>
			)}
		</form>
	);
}
