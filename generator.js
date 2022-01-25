/**
 * Ponyon Emoji Generator
 */

'use strict';

const SRC_DIR_PATH = `${__dirname}/src-pngs`;
const DST_DIR_PATH = `${__dirname}/dst-pngs`;

const SRC_NOTO_EMOJI_ZIP_URL = 'https://github.com/googlei18n/noto-emoji/archive/v2017-05-18-cook-color-fix.zip';

const emojiNameMap = require('emoji-name-map');
const fs = require('fs');
const request = require('request');
const unzip = require('unzip-stream');

(async () => {

	try {
		await downloadEmojis();
		convertEmojiNames();
		console.log(`Done :)\nPlease open ${DST_DIR_PATH}`);
	} catch (e) {
		console.error(err);
		process.exit(1);	
	};
	process.exit(0);

})();



function downloadEmojis () {

	return new Promise((resolve, reject) => {

		console.log(`Downloading... ${SRC_NOTO_EMOJI_ZIP_URL}`)
		request.get(SRC_NOTO_EMOJI_ZIP_URL)
		.on('error', (err) => {

			reject(err);

		})
		.pipe(unzip.Parse())
		.on('entry', (entry) => {

			const file_path = entry.path;
			if (file_path.match(/png\/128\/(.*)\.png$/)) {
				const file_name = RegExp.$1 + '.png';
				console.log(`Unzipping ${file_name} -> ${SRC_DIR_PATH}/${file_name}`);

				try {
					entry.pipe(fs.createWriteStream(`${SRC_DIR_PATH}/${file_name}`));
				} catch (e) {
					console.warn('WARN - ' + e);
				}

			} else {
				entry.autodrain();
			}

		})
		.on('finish', () => {

			console.log('Unzipping completed.');
			resolve();

		});

	});

}


function convertEmojiNames () {

	const emoji_names = emojiNameMap.emoji;

	if (!fs.existsSync(DST_DIR_PATH)){
		fs.mkdirSync(DST_DIR_PATH);
	}

	for (const emoji_name in emoji_names) {

		const emoji_unicode_id = emoji_names[emoji_name].codePointAt(0).toString(16);
		const src_file_name = `emoji_u${emoji_unicode_id}.png`;

		if (!fs.existsSync(`${SRC_DIR_PATH}/${src_file_name}`)) {
			console.warn(`[${emoji_name}] ${src_file_name} - Not found`);
			continue;
		}

		const dst_file_name = `g_${emoji_name}.png`;

		console.log(`[${emoji_name}] ${src_file_name} -> ${dst_file_name}`);
		fs.copyFileSync(`${SRC_DIR_PATH}/${src_file_name}`, `${DST_DIR_PATH}/${dst_file_name}`);

	}

}
