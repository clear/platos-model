require("should");
var _ = require("underscore");
var Model = require("../../lib/platos-model");

//Global setup and teardown for integration tests
before(function (done) {
	Model.connect("platos-model-test");
	
	Model._db.dropDatabase(done);
});

describe("INTEGRATION - SAVE", function () {
	//Note: The very first integration test will be slow because it creates the database
	it("Class.save() with no properties should save a document with only _id", function (done) {
		var Class = Model.create("Class");
		var instance = new Class();
		
		instance.save(function (err, document) {
			_.isNull(err).should.be.ok;
			_.size(document).should.equal(1);
			document.should.have.property("_id");

			done();
		});
	});
	
	it("Class.save() should add _id to the model instance", function (done) {
		var Class = Model.create("Class");
		var instance = new Class();
		
		instance.should.not.have.property("_id");
		
		instance.save(function () {
			instance.should.have.property("_id");
			done();
		});
	});
	
	it("Class.save() when properties exist should save a document with those properties", function (done) {
		var Class = Model.create("Class");
		var instance = new Class();
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