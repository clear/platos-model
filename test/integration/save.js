require("should");
var _ = require("underscore");
var Platos = require("../../lib/platos-model");

//Global setup and teardown for integration tests
before(function (done) {
	Platos.connect("platos-model-test");
	
	Platos._db.dropDatabase(done);
});

describe("INTEGRATION - SAVE", function () {
	//Note: The very first integration test will be slow because it creates the database
	it("Model.save() with no properties should save a document with only _id", function (done) {
		var Model = Platos.create("Model");
		var instance = new Model();
		
		instance.save(function (err, document) {
			_.isNull(err).should.be.ok;
			_.size(document).should.equal(1);
			document.should.have.property("_id");

			done();
		});
	});
	
	it("Model.save() should add _id to the Platos instance", function (done) {
		var Model = Platos.create("Model");
		var instance = new Model();
		
		instance.should.not.have.property("_id");
		
		instance.save(function () {
			instance.should.have.property("_id");
			done();
		});
	});
	
	it("Model.save() when properties exist should save a document with those properties", function (done) {
		var Model = Platos.create("Model");
		var instance = new Model();
		instance.test = "property";
		
		instance.save(function (err, document) {
			_.isNull(err).should.be.ok;
			_.size(document).should.equal(2);
			document.should.have.property("_id");
			document.should.have.property("test");
			document.test.should.equal("property");

			done();
		});
	});
});