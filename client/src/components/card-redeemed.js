import React from 'react';
import { MAP } from '../consts';
import { mapCardType } from '../utils';

export default function Redeemed(props) {
	const handleSubmit = (e) => {
		e.preventDefault();
		props.clear();
	};

	return (
		<>
			{props.redeemed &&
				<div id="overlay">&nbsp;
					<div id="redeemed">
						<form onSubmit={handleSubmit}>
							<label><span className="name">{props.redeemed.player}</span> redeeming...</label>
							<ul>
								<li>
									<div className="rcard">
										<div className="card-name">{props.redeemed.card1}</div>
										<div className="card-type">{mapCardType(MAP[props.redeemed.card1].card)}</div>
									</div>
								</li>
								<li>
									<div className="rcard">
										<div className="card-name">{props.redeemed.card2}</div>
										<div className="card-type">{mapCardType(MAP[props.redeemed.card2].card)}</div>
									</div>
								</li>
								<li>
									<div className="rcard">
										<div className="card-name">{props.redeemed.card3}</div>
										<div className="card-type">{mapCardType(MAP[props.redeemed.card3].card)}</div>
									</div>
								</li>
							</ul>
							<input type="submit" value="&times;" />
						</form>
					</div>
				</div>
			}
		</>
	);
}
