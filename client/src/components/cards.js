import React, { useState, useEffect } from 'react';

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

	//TODO TEMP!!!!!!!!!!!!!!!!!
	const cards = (props.cards && (props.cards.length > 0)) ? props.cards : [
		{ name: "Congo", type: "Artillery" }, { name: "Western-United-States", type: "Infantry" }, { name: "Alberta", type: "Infantry" },
		{ name: "China", type: "Artillery" }, { name: "India", type: "Infantry" }
	];

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
			{props.playerToken &&
				<form key={compKey}
					id="cards"
					onSubmit={handleSubmit}>
					<ul id="card-list" onChange={handleSelect}>
						{cards.map(c =>
							(<li key={c.name}>
								<div className="card">
									<div className="card-name">{c.name}</div>
									<div className="card-type">{c.type}</div>
									<input
										type="checkbox"
										value={c.name}
										defaultChecked={values.includes(c.name)} />
								</div>
							</li>)
						)}
					</ul>
					<input type="submit" value="&crarr;" />
				</form>
			}
		</>
	);
}
