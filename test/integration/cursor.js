require("should");
var _ = require("underscore");
var Platos = require("../../lib/platos-model");

describe("INTEGRATION - CURSOR", function () {
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
	
	describe("sort", function () {
		it("Model.find().sort() - with no arguments - should return all documents as an instance of Model", function (done) {
			Model.find().sort(function (err, objects) {
				_.isFunction(objects[0].save).should.be.ok;
				_.isFunction(objects[0].remove).should.be.ok;
				_.isFunction(objects[1].save).should.be.ok;
				_.isFunction(objects[1].remove).should.be.ok;
				
				done();
			});
		});
		
		it("Model.find().sort() - with no arguments - should return all documents in natural order", function (done) {
			Model.find().sort(function (err, objects) {
				objects.length.should.equal(2);
				objects[0]._id.equals(instance._id).should.be.ok;
				objects[1]._id.equals(instance2._id).should.be.ok;
				
				done();
			});
		});
		
		it("Model.find().sort() - with reverse true - should return all documents in reverse order", function (done) {
			Model.find().sort({ $natural: -1 }, function (err, objects) {
				objects.length.should.equal(2);
				objects[0]._id.equals(instance2._id).should.be.ok;
				objects[1]._id.equals(instance._id).should.be.ok;
				
				done();
			});
		});
		
		it("Model.find().sort() - with find parameters but no sort arguments - should return the document matching property", function (done) {
			Model.find({ test2: "property2" }).sort(function (err, objects) {
				objects.length.should.equal(1);
				objects[0]._id.equals(instance2._id).should.be.ok;
				objects[0].should.have.property("test2");
				
				done();
			});
		});
		
		it("Model.find().sort() - with find() parameters and sort() arguments - should return the documents with shared property in reverse order", function (done) {
			Model.find({ test: "property" }).sort({ $natural: -1 }, function (err, objects) {
				objects.length.should.equal(2);
				objects[0]._id.equals(instance2._id).should.be.ok;
				objects[1]._id.equals(instance._id).should.be.ok;
				
				done();
			});
		});
	});
	
	describe("limit", function () {
		it("Model.find().limit() - with no arguments - should return all documents", function (done) {
			Model.find().limit(function (err, objects) {
				objects.length.should.equal(2);
				
				done();
			});
		});
		
		it("Model.find().limit() - with argument '1' - should return a single document", function (done) {
			Model.find().limit(1, function (err, objects) {
				objects.length.should.equal(1);
				objects[0]._id.equals(instance._id).should.be.ok;
				
				done();
			});
		});
		
		it("Model.find().limit() - with no arguments - should return all documents as an instance of Model", function (done) {
			Model.find().limit(function (err, objects) {
				_.isFunction(objects[0].save).should.be.ok;
				_.isFunction(objects[0].remove).should.be.ok;
				_.isFunction(objects[1].save).should.be.ok;
				_.isFunction(objects[1].remove).should.be.ok;
				
				done();
			});
		});
	});
	
	describe("skip", function () {
		it("Model.find().skip() - with no arguments - should return all documents", function (done) {
			Model.find().skip(function (err, objects) {
				objects.length.should.equal(2);
				
				done();
			});
		});
		
		it("Model.find().skip() - with argument '1' - should return the second document", function (done) {
			Model.find().skip(1, function (err, objects) {
				objects.length.should.equal(1);
				objects[0]._id.equals(instance2._id).should.be.ok;
				
				done();
			});
		});
		
		it("Model.find().skip() - with no arguments - should return all documents as an instance of Model", function (done) {
			Model.find().skip(function (err, objects) {
				_.isFunction(objects[0].save).should.be.ok;
				_.isFunction(objects[0].remove).should.be.ok;
				_.isFunction(objects[1].save).should.be.ok;
				_.isFunction(objects[1].remove).should.be.ok;
				
				done();
			});
		});
	});
});