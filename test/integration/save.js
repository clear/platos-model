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
	it("model.save() - with no arguments - should save a document with only _id", function (done) {
		var Model = Platos.create("Model");
		var instance = new Model();
		
		instance.save(function (err, document) {
			_.isNull(err).should.be.ok;
			_.size(document).should.equal(1);
			document.should.have.property("_id");

			done();
		});
	});
	
	it("model.save() - with no arguments - should add _id to the Platos instance", function (done) {
		var Model = Platos.create("Model");
		var instance = new Model();
		
		instance.should.not.have.property("_id");
		
		instance.save(function () {
			instance.should.have.property("_id");
			done();
		});
	});
	
	it("model.save() - when properties exist - should save a document with those properties", function (done) {
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
	
	it("model.save() - when defining a separate collection name - should save the document", function (done) {
		var Model = Platos.create("Model", "custom.collection");
		var instance = new Model({ test: "property" });
		
		instance.save(function (err, document) {
			_.isNull(err).should.be.ok;
			_.size(document).should.equal(2);
			document.should.have.property("_id");
			document.should.have.property("test");
			document.test.should.equal("property");

			done();
		});
	});
	
	it("model.save() - with passed in object - should save and add _id to the instance", function (done) {
		var Model = Platos.create("Model");
		
		var instance = new Model({ test: "property" });

		instance.save({ test2: "property" }, function (err, document) {
			instance.should.have.property("_id");
			instance.should.have.property("test");
			instance.should.not.have.property("test2");
			document.should.not.have.property("test");
			document.should.have.property("test2");
			
			done();
		});
	});
	
	it("model.save() - with pre hook that mutates the object - should save and add _id to the Model instance", function (done) {
		var Model = Platos.create("Model");
		
		Model.pre("save", function (next, object, callback) {
			next({ test: "replace" }, callback);
		});
		
		var instance = new Model();
		
		instance.save(function (err, document) {
			instance.should.have.property("_id");
			instance.should.not.have.property("test");
			document.should.have.property("test");
			
			done();
		});
	});
	
	it("model.save() - with empty pre hook - should save and add _id to the instance", function (done) {
		var Model = Platos.create("Model");
		
		Model.pre("save", function (next, object, callback) {
			next(object, callback);
		});
		
		var instance = new Model({ test: "property" });
		
		instance.save(function (err, document) {
			instance.should.have.property("_id");
			instance.should.have.property("test");
			document.should.have.property("test");
			
			done();
		});
	});
});