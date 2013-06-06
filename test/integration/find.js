require("should");
var _ = require("underscore");
var Platos = require("../../lib/platos-model");

describe("INTEGRATION - FIND", function () {
	describe("from single", function () {
		var Model, instance;
		
		before(function (done) {
			//Insert a document into the database to test finding
			Platos._db.collection("Model").drop(function () {
				Model = Platos.create("Model");
				instance = new Model();
				instance.test = "property";

				instance.save(done);
			});
		});
		
		after(function (done) {
			Platos._db.collection("Model").drop(done);
		});
		
		it("Model.find() - with no arguments - should return all documents", function (done) {
			Model.find(function (err, objects) {
				_.isNull(err).should.be.ok;
				objects.length.should.equal(1);
				objects[0]._id.equals(instance._id).should.be.ok;
				objects[0].should.have.property("test");
				objects[0].test.should.equal("property");
				
				done();
			});
		});
		
		it("Model.find() - with no arguments - should return instances of Model", function (done) {
			Model.find(function (err, objects) {
				_.isFunction(objects[0].save).should.be.ok;
				_.isFunction(objects[0].remove).should.be.ok;
				
				done();
			});
		});
		
		it("Model.find() - with _id - should return a single document matching _id", function (done) {
			Model.find({ _id: instance._id }, function (err, objects) {
				objects.length.should.equal(1);
				objects[0]._id.equals(instance._id).should.be.ok;
				objects[0].should.have.property("test");
				objects[0].test.should.equal("property");
				
				done();
			});
		});
		
		it("Model.find() - with property - should return a single document matching property", function (done) {
			Model.find({ test: "property" }, function (err, objects) {
				objects.length.should.equal(1);
				objects[0]._id.equals(instance._id).should.be.ok;
				objects[0].should.have.property("test");
				objects[0].test.should.equal("property");
				
				done();
			});
		});
		
		it("Model.find() - when property value deosn't match - should not return any documents", function (done) {
			Model.find({ test: "missing" }, function (err, objects) {
				_.isNull(err).should.be.ok;
				objects.length.should.equal(0);
				
				done();
			});
		});
		
		it("Model.find() - when property does not exist - should not return any documents", function (done) {
			Model.find({ missing: "property" }, function (err, objects) {
				_.isNull(err).should.be.ok;
				objects.length.should.equal(0);
				
				done();
			});
		});
	});
	
	describe("from multiple", function () {
		var Model, instance, instance2;
		
		before(function (done) {
			//Insert a document into the database to test finding
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
		
		after(function (done) {
			Platos._db.collection("Model").drop(done);
		});
		
		it("Model.find() - with no arguments - should return all documents", function (done) {
			Model.find(function (err, objects) {
				_.isNull(err).should.be.ok;
				objects.length.should.equal(2);
				
				done();
			});
		});
		
		it("Model.find() - with no arguments - should return instances of Model", function (done) {
			Model.find(function (err, objects) {
				_.isNull(err).should.be.ok;
				objects.length.should.equal(2);
				
				_.isFunction(objects[0].save).should.be.ok;
				_.isFunction(objects[0].remove).should.be.ok;
				_.isFunction(objects[1].save).should.be.ok;
				_.isFunction(objects[1].remove).should.be.ok;
				
				done();
			});
		});
		
		it("Model.find() - with shared property - should return both documents matching property", function (done) {
			Model.find({ test: "property" }, function (err, objects) {
				objects.length.should.equal(2);

				done();
			});
		});
		
		it("Model.find() - with unique property - should return the document matching property", function (done) {
			Model.find({ test2: "property2" }, function (err, objects) {
				objects.length.should.equal(1);
				objects[0]._id.equals(instance2._id).should.be.ok;
				objects[0].should.have.property("test2");
				
				done();
			});
		});
	});
});