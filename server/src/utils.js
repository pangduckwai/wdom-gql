const fs = require('fs');

function sleep(time) {
	return new Promise(resolve => setTimeout(() => resolve(), time));
}

module.exports.readln = ({path, encoding, readSize, separator = '\n', process, finished}) => {
	const reader = fs.createReadStream(path).setEncoding(encoding);
	let read, left = "";
	let idx;
	let count = 0, ended = false;
	reader.on('readable', async () => {
		while (null !== (read = reader.read(readSize))) {
			const items = read.split(separator);
			ended = false;
			if (items.length > 1) {
				await process(left + items[0], count); // Process the first line in the current batch
				count ++;

				for (idx = 1; idx < (items.length - 1); idx ++) {
					await process(items[idx], count); // PRocess the remaining lines in the current batch
					count ++;
				}

				left = items[idx]; // Store the lefeovers for the first line of the next batch
			} else if (items.length === 1) { //Checking just to be safe, split() should always return array with at least 1 item
				left += items[0]; // A line larger than the 'readSize', concat until a line separator is encountered
			}
		}
		ended = true;
	});
	reader.on('end', async () => {
		while (!ended) {
			await sleep(100);
		}

		if (left.trim() !== "") {
			await process(left, count); // Process anything left after the last line separator
			count ++;
		}
		if (ended) finished(count);
	})
};
