const fs = require('fs');

module.exports.readln = ({path, encoding, readSize, separator = '\n', process, finished}) => {
	const reader = fs.createReadStream(path).setEncoding(encoding);
	let read, left = "";
	let idx;
	let count = 0, started = false;
	reader.on('readable', async () => {
		while (null !== (read = reader.read(readSize))) {
			const items = read.split(separator);
			if (items.length > 1) {
				started = true; // Need this so 'finished' will not be called by the alternate exec flow splitted by the first 'await'

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
		if (left.trim() !== "") {
			await process(left, count); // Process anything left after the last line separator
			count ++;
		}
		if (started) finished(count);
	});
};
