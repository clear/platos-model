require("should");
var _ = require("underscore");
var Platos = require("../../lib/platos-model");

describe("INTEGRATION - DROP", function () {
	var Model, instance, instance2;
	
	beforeEach(function (done) {
		Platos._db.collection("Model").drop(function () {
			Model = Platos.create("Model");
			instance = new Model();
			instance.test = "property";

			instance.save(function () {
				instance2 = new Model({ test: "property", test2: "property2" });
				instance2.save(done);
			});
		});
	});
	
	afterEach(function (done) {
		Platos._db.collection("Model").drop(function () {
			done();
		});
	});
	
	it("Model.drop() - with no arguments - should remove the collection", function (done) {
		Model.drop(function (err) {
			_.isNull(err).should.be.ok;

			//Ensure removed
			Model.find(function (err, objects) {
				objects.length.should.equal(0);
				done();
			});
		});
	});
});