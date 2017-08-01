import MagicString from 'magic-string';

export default function replaceConfig(config = {}, options) {
	const configName = Object.keys(config)[0];
	const jsonifyConfig = configPart => Object.keys(configPart).reduce(
		(obj, key) => {
			typeof configPart[key] === 'object' ? obj[key] = jsonifyConfig(configPart[key]) : obj[key] = JSON.stringify(configPart[key]);
			return obj;
		}, {});

	const replacer = (propertyName) => {
		let configValue = textConfig[configName], configPath = propertyName.split('.').reverse();
		do {
			configValue = configValue[configPath.pop()];
		} while (configValue !== undefined && configPath.length); // eslint-disable-line
		//Replace only when the config actually has the value required
		if (configValue !== undefined && configValue !== null) { // eslint-disable-line
			return configValue;
		}
		return 'null';
	};

	const textConfig = jsonifyConfig(config);
	const pattern = new RegExp(configName + '\\.([\\w\\.]+)', 'g');

	return {
		name: 'config',

		transform(code) {
			if (!configName) {
				return null;
			}

			const magicString = new MagicString(code);
			let match, hasReplacements = false, start, end;
			while (match = pattern.exec(code)) {
				hasReplacements = true;

				start = match.index;
				end = start + match[0].length;
				const replacement = replacer(match[1]);

				magicString.overwrite(start, end, replacement);
			}

			return hasReplacements ? {code: magicString.toString()} : null;
		}
	};

}