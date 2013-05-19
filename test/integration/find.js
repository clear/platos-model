require("should");
var _ = require("underscore");
var Model = require("../../lib/platos-model");

describe("INTEGRATION - FIND", function () {
	describe("from single", function () {
		var Class, instance;
		
		before(function (done) {
			//Insert a document into the database to test finding
			Model._db.collection("Class").drop(function () {
				Class = Model.create("Class");
				instance = new Class();
				instance.test = "property";

				instance.save(done);
			});
		});
		
		after(function (done) {
			Model._db.collection("Class").drop(done);
		});
		
		it("Class.find() should return all documents", function (done) {
			Class.find(function (err, objects) {
				_.isNull(err).should.be.ok;
				objects.length.should.equal(1);
				objects[0]._id.equals(instance._id).should.be.ok;
				objects[0].should.have.property("test");
				objects[0].test.should.equal("property");
				
				done();
			});
		});
		
		it("Class.find({ _id: _id }) should return a single document matching _id", function (done) {
			Class.find({ _id: instance._id }, function (err, objects) {
				objects.length.should.equal(1);
				objects[0]._id.equals(instance._id).should.be.ok;
				objects[0].should.have.property("test");
				objects[0].test.should.equal("property");
				
				done();
			});
		});
		
		it("Class.find({ test: 'property' }) should return a single document matching test property", function (done) {
			Class.find({ test: "property" }, function (err, objects) {
				objects.length.should.equal(1);
				objects[0]._id.equals(instance._id).should.be.ok;
				objects[0].should.have.property("test");
				objects[0].test.should.equal("property");
				
				done();
			});
		});
		
		it("Class.find({ test: 'missing' }) should not return any documents", function (done) {
			Class.find({ test: "missing" }, function (err, objects) {
				_.isNull(err).should.be.ok;
				objects.length.should.equal(0);
				
				done();
			});
		});
		
		it("Class.find({ missing: 'property' }) should not return any documents", function (done) {
			Class.find({ missing: "property" }, function (err, objects) {
				_.isNull(err).should.be.ok;
				objects.length.should.equal(0);
				
				done();
			});
		});
	});
	
	describe("from multiple", function () {
		var Class, instance, instance2;
		
		before(function (done) {
			//Insert a document into the database to test finding
			Model._db.collection("Class").drop(function () {
				Class = Model.create("Class");
				instance = new Class();
				instance.test = "property";

				instance.save(function () {
					instance2 = new Class({ test: "property", test2: "property2" });
					instance2.save(done);
				});
			});
		});
		
		after(function (done) {
			Model._db.collection("Class").drop(done);
		});
		
		it("Class.find() should return all documents", function (done) {
			Class.find(function (err, objects) {
				_.isNull(err).should.be.ok;
				objects.length.should.equal(2);
				
				done();
			});
		});
		
		it("Class.find({ test: 'property' }) should return both documents matching test property", function (done) {
			Class.find({ test: "property" }, function (err, objects) {
				objects.length.should.equal(2);

				done();
			});
		});
		
		it("Class.find({ test2: 'property2' }) should return the document matching test2 property", function (done) {
			Class.find({ test2: "property2" }, function (err, objects) {
				objects.length.should.equal(1);
				objects[0]._id.equals(instance2._id).should.be.ok;
				objects[0].should.have.property("test2");

				done();
			});
		});
	});
});