import React, { useState, useEffect } from 'react';
// import { isRedeemable } from '../utils';

export default function Cards(props) {
	const [compKey, setCompKey] = useState(0);
	const [values, setValues] = useState([]);
	const [scroll, setScroll] = useState(0);

	useEffect(() => {
		const list = document.getElementById("card-list");
		if (list) {
			list.scrollLeft = scroll;
		}
	});

	const handleSelect = (e) => {
		let array = values.map(c => c);
		let selected = e.target.value;

		const index = array.indexOf(selected);
		if (index >= 0) {
			array.splice(index, 1);
		} else {
			array.push(selected);
			if (array.length > 3) array.shift();
		}

		setValues(array);

		const list = document.getElementById("card-list");
		setScroll(list.scrollLeft);
		setCompKey(compKey + 1);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("Redeem...", JSON.stringify(values));
	};

	return (
		<>
			{props.playerToken && (props.cards.length > 0) &&
				<form key={compKey}
					id="cards"
					onSubmit={handleSubmit}>
					<ul id="card-list" onChange={handleSelect}>
						{props.cards.map(c => {
							const idx = props.territoryIdx[c.name];
							const territory = (typeof(idx) !== "undefined") && (idx >= 0) && (props.territories.length > 0) ? props.territories[idx] : {};
							return (<li key={c.name}>
								<div className="card">
									<div className="card-name">
										{territory.owner && (territory.owner.token === props.playerToken) ? "*" : "" }
										{c.name}
									</div>
									<div className="card-type">{c.type}</div>
									<input
										type="checkbox"
										value={c.name}
										defaultChecked={values.includes(c.name)} />
								</div>
							</li>);
						})}
					</ul>
					<input type="submit" value="&crarr;" />
				</form>
			}
		</>
	);
}
