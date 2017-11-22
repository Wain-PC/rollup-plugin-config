import babel from 'babel-core';

export default function replaceConfig(config = {}) {
	const keys = Object.keys(config),
		replacer = (configObj, propertiesPathArray, rootKey) => {
			let configValue = configObj[rootKey];
			do {
				const key = propertiesPathArray.pop();
				configValue = configValue[key];
			} while (configValue !== undefined && propertiesPathArray.length); // eslint-disable-line
			//Replace only when the config actually has the value required
			if (configValue !== undefined && configValue !== null) { // eslint-disable-line
				return configValue;
			}
			return null;
		},
		plugin = function ({ types: t }) {
			let pathArr, level = 0, isReplaceable;
			return {
				visitor: {
					MemberExpression: {
						enter(path) {
							//Reset the `replaceable` flag if we're beginning to explore the MemberExpression
							if (!level) {
								isReplaceable = false;
								pathArr = [];
							}
							level += 1;
							pathArr.push(path.node.property.name);
							// If the node has its object's name (final node), we're ready to make an assumption
							// about its replaceability
							if (~keys.indexOf(path.node.object.name)) {
								isReplaceable = path.node.object.name;
							}
						},
						exit(path) {
							level -= 1;
							//Full path is now constructed, let's find a corresponding config value
							if (!level && isReplaceable) {
								const value = replacer(config, pathArr, isReplaceable), type = typeof value;
								if (type === 'string') {
									path.replaceWith(t.stringLiteral(value));
								} else if (type === 'number') {
									path.replaceWith(t.numericLiteral(value));
								} else if (type === 'boolean') {
									path.replaceWith(t.booleanLiteral(value));
								} else if (type === 'object') {
									if (!value) {
										path.replaceWith(t.nullLiteral());
									}
								}
							}
						}
					}
				}
			};
		};

	return {
		name: 'config',
		transform(bundleCode) {
			const {code, ast, map} = babel.transform(bundleCode, { plugins: [plugin] });
			return {code, map};
		}
	};
}
