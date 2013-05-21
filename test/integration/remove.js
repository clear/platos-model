require("should");
var _ = require("underscore");
var Platos = require("../../lib/platos-model");

describe("INTEGRATION - REMOVE", function () {
	var Model, instance, instance2;
	
	beforeEach(function (done) {
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
	
	afterEach(function (done) {
		Platos._db.collection("Model").drop(done);
	});
	
	describe("static method", function () {
		it("Model.remove() should remove all documents", function (done) {
			Model.remove(function (err) {
				_.isNull(err).should.be.ok;

				//Ensure removed
				Model.find(function (err, objects) {
					objects.length.should.equal(0);
					done();
				});
			});
		});

		it("Model.remove({ test2: 'property2' }) should remove one document and leave the other", function (done) {
			Model.remove({ test2: "property2" }, function (err) {
				_.isNull(err).should.be.ok;

				//Ensure removed
				Model.find(function (err, objects) {
					objects.length.should.equal(1);
					objects[0]._id.equals(instance._id).should.be.ok;
					done();
				});
			});
		});
		
		it("Model.remove({ missing: 'property' }) should not remove any documents", function (done) {
			Model.remove({ test2: "property" }, function (err) {
				_.isNull(err).should.be.ok;

				//Ensure removed
				Model.find(function (err, objects) {
					objects.length.should.equal(2);
					done();
				});
			});
		});
	});
	
	describe("instance method", function () {
		it("instance.remove() should remove the document called on", function (done) {
			instance.remove(function (err) {
				_.isNull(err).should.be.ok;

				//Ensure removed
				Model.find(function (err, objects) {
					objects.length.should.equal(1);
					objects[0]._id.equals(instance2._id).should.be.ok;
					done();
				});
			});
		});
	});
});