require("should");
var Platos = require("../../lib/platos-model");

describe("UNIT - UTILITIES", function () {
	describe("sanitise", function () {
		it("Platos.util.sanitise() - with an object with plain keys - should not change the key", function () {
			var object = {
				abcdefghiklmnopqrstuvwxyz: "just fine"
			};

			Platos.util.sanitise(object).should.have.property("abcdefghiklmnopqrstuvwxyz");
		});

		it("Platos.util.sanitise() - with a key containing a '.' - should replace with 'U+FF0E'", function () {
			var object = {
				"test.this": "not good"
			};

			Platos.util.sanitise(object).should.have.property("testU+FF0Ethis");
		});

		it("Platos.util.sanitise() - with a key containing multiple '.' chars - should replace all with 'U+FF0E'", function () {
			var object = {
				"test.this.another.here": "not good"
			};

			Platos.util.sanitise(object).should.have.property("testU+FF0EthisU+FF0EanotherU+FF0Ehere");
		});

		it("Platos.util.sanitise() - with a key containing a '$' - should replace with 'U+FF04'", function () {
			var object = {
				"test$this": "not good"
			};

			Platos.util.sanitise(object).should.have.property("testU+FF04this");
		});

		it("Platos.util.sanitise() - with a key containing multiple '$' chars - should replace all with 'U+FF04'", function () {
			var object = {
				"test$this$another$here": "not good"
			};

			Platos.util.sanitise(object).should.have.property("testU+FF04thisU+FF04anotherU+FF04here");
		});

		it("Platos.util.sanitise() - with a key containing both '.' and '$' - should replace them respectively", function () {
			var object = {
				"here's a $ and now a .": "what an unlikely key!"
			};

			Platos.util.sanitise(object).should.have.property("here's a U+FF04 and now a U+FF0E");
		});
	});

	describe("unsanitise", function () {
		it("Platos.util.unsanitise() - with an object with plain keys - should not change the key", function () {
			var object = {
				abcdefghiklmnopqrstuvwxyz: "just fine"
			};

			Platos.util.unsanitise(object).should.have.property("abcdefghiklmnopqrstuvwxyz");
		});

		it("Platos.util.unsanitise() - with a key containing a 'U+FF0E' - should replace with '.'", function () {
			var object = {
				"testU+FF0Ethis": "not good"
			};

			Platos.util.unsanitise(object).should.have.property("test.this");
		});

		it("Platos.util.unsanitise() - with a key containing multiple 'U+FF0E' chars - should replace all with '.'", function () {
			var object = {
				"testU+FF0EthisU+FF0EanotherU+FF0Ehere": "not good"
			};

			Platos.util.unsanitise(object).should.have.property("test.this.another.here");
		});

		it("Platos.util.unsanitise() - with a key containing a '$' - should replace with 'U+FF04'", function () {
			var object = {
				"testU+FF04this": "not good"
			};

			Platos.util.unsanitise(object).should.have.property("test$this");
		});

		it("Platos.util.unsanitise() - with a key containing multiple '$' chars - should replace all with 'U+FF04'", function () {
			var object = {
				"testU+FF04thisU+FF04anotherU+FF04here": "not good"
			};

			Platos.util.unsanitise(object).should.have.property("test$this$another$here");
		});

		it("Platos.util.unsanitise() - with a key containing both '.' and '$' - should replace them respectively", function () {
			var object = {
				"here's a U+FF04 and now a U+FF0E": "what an unlikely key!"
			};

			Platos.util.unsanitise(object).should.have.property("here's a $ and now a .");
		});
	});
});