const rollup = require('rollup'),
	config = require('..');

process.chdir(__dirname);


const testFunc = function (entry, configValue, expectedValue) {
	return function () {
		expect.assertions(2);
		return rollup.rollup({
			entry: `./fixtures/${entry}.js`,
			plugins: [
				config(configValue)
			]
		}).then(function (bundle) {
			return bundle.generate({format: 'es', sourceMap: true}).then(function (res) {
				expect(res.code).toContain(expectedValue);
				expect(res.map.mappings.length).toBeGreaterThan(0);
			});
		});
	}
};

describe('rollup-plugin-config', function () {
	it('replaces variables of different types (part 1)', testFunc('simple', {
		CONFIG: {
			name: 'Joe',
			age: 24,
			married: false
		}
	}, 'console.log("Joe" + 24 + false);'));


	it('replaces variables of different types (part 2)', testFunc('simple', {
		CONFIG: {
			name: '',
			age: 0,
			married: null
		}
	}, 'console.log("" + 0 + null);'));

	it('doesn`t replace properties with the same name', testFunc('nested_properties', {
		CONFIG: {
			name: 'Joe'
		}
	}, 'console.log(window.CONFIG.name + "Joe");'));

	it('returns null for variables not in config', testFunc('simple', {
		CONFIG: {
			name: 'Joe'
		}
	}, 'console.log("Joe" + null + null);'));


	it('replaces nested variables of different types', testFunc('nested', {
		CONFIG: {
			first: {
				name: 'Joe',
			},
			second: {
				third: {
					age: 24
				}
			}
		}
	}, 'console.log("Joe" + 24);'));


	it('doesn`t change the input when config is incorrect (has no `root`)', testFunc('simple', {}, 'console.log(CONFIG.name + CONFIG.age + CONFIG.married);'));

	it('doesn`t change the input when there`s no config provided', testFunc('simple', undefined, 'console.log(CONFIG.name + CONFIG.age + CONFIG.married);'));

	it('doesn`t change the input when there`s nothing to replace', testFunc('nothing_to_replace', {CONFIG: {one: 1}}, 'console.log("Hey Joe!");'));

});