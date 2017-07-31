const rollup = require('rollup'),
	config = require('..');

process.chdir(__dirname);

describe('rollup-plugin-replace', function () {
	it('replaces variables of different types', function () {
		expect.assertions(1);
		return rollup.rollup({
			entry: './fixtures/simple.js',
			plugins: [
				config({
					CONFIG: {
						name: 'Joe',
						age: 24,
						married: false
					}
				})
			]
		}).then(function (bundle) {
			return bundle.generate({format: 'es'}).then(function (res) {
				expect(res.code).toContain('console.log("Joe" + 24 + false);')
			});
		});
	});

	it('returns null for variables not in config', function () {
		expect.assertions(1);
		return rollup.rollup({
			entry: './fixtures/simple.js',
			plugins: [
				config({
					CONFIG: {
						name: 'Joe'
					}
				})
			]
		}).then(function (bundle) {
			return bundle.generate({format: 'es'}).then(function (res) {
				expect(res.code).toContain('console.log("Joe" + null + null);')
			});
		});
	});


	it('replaces nested variables of different types', function () {
		expect.assertions(1);
		return rollup.rollup({
			entry: './fixtures/nested.js',
			plugins: [
				config({
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
				})
			]
		}).then(function (bundle) {
			return bundle.generate({format: 'es'}).then(function (res) {
				expect(res.code).toContain('console.log("Joe" + 24);')
			});
		});
	});
});