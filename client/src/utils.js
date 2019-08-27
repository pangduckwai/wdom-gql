
export function convert(tid) {
	const buff = tid.split("");
	let found = true;
	for (let i = 0; i < buff.length; i ++) {
		if (found) {
			found = false;
			buff[i] = buff[i].toUpperCase();
		} else if (buff[i] === '-') {
			found = true;
		}
	}
	return buff.join("");
}

export function getMousePosition(svg, xpos, ypos) {
	const CTM = svg.getScreenCTM();
	return {
		xpos: (xpos - CTM.e) / CTM.a,
		ypos: (ypos - CTM.f) / CTM.d
	};
}
