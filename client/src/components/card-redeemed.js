import React from 'react';
import Card from './card';

export default function Redeemed(props) {
	const handleSubmit = (e) => {
		e.preventDefault();
		props.clear();
	};

	return (
		<div id="overlay">&nbsp;
			<div id="redeemed">
				<form onSubmit={handleSubmit}>
					<label><span className="name">{props.redeemed.player}</span> redeeming...</label>
					<ul>
						<li>
							<Card card={props.redeemed.card1} />
						</li>
						<li>
							<Card card={props.redeemed.card2} />
						</li>
						<li>
							<Card card={props.redeemed.card3} />
						</li>
					</ul>
					<input type="submit" value="&times;" />
				</form>
			</div>
		</div>
	);
}
