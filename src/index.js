import babel from 'babel-core';
import * as babylon from 'babylon';

export default function replaceConfig(config = {}) {
	const keys = Object.keys(config),
		replacer = (configObj, propertiesPathArray) => {
			let configValue = configObj;
			do {
				const key = propertiesPathArray.shift();
				configValue = configValue[key];
			} while (configValue !== undefined && propertiesPathArray.length); // eslint-disable-line
			//Replace only when the config actually has the value required
			if (configValue !== undefined && configValue !== null) { // eslint-disable-line
				return configValue;
			}
			return null;
		},
		plugin = function ({types: t}) {
			return {
				visitor: {
					MemberExpression(path) {
						//If the expression contains the root key of the config, we should travel atop of it
						// to find a full path and replace it with the config value
						if (path.node.object.name && ~keys.indexOf(path.node.object.name)) {
							let currentPath = path, prevPath, pathArr = [];
							pathArr.push(path.node.object.name);
							while (t.isMemberExpression(currentPath.node)) {
								prevPath = currentPath;
								pathArr.push(currentPath.node.property.name);
								currentPath = currentPath.parentPath;
							}
							const value = replacer(config, pathArr);
							const ast = babylon.parse(("var code = " + (JSON.stringify(value)) + ";"));
							prevPath.replaceWith(ast.program.body[0].declarations[0].init);
						}
					}
				}
			};
		};

	return {
		name: 'config',
		transform(bundleCode) {
			const {code, map} = babel.transform(bundleCode, {plugins: [plugin], sourceMaps: true});
			return {code, map};
		}
	};
}
