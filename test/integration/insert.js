require("should");
var _ = require("underscore");
var Platos = require("../../lib/platos-model");

describe.only("INTEGRATION - INSERT", function () {
	var Model = Platos.create("Model");
	
	beforeEach(function (done) {
		Platos._db.collection("Model").drop(function () {
			done();
		});
	});
	
	afterEach(function (done) {
		Platos._db.collection("Model").drop(done);
	});
	
	it("Model.insert() - with one document - should return an Array", function (done) {
		Model.insert({ test: "document" }, function (err, documents) {
			_.isNull(err).should.be.ok;
			_.isArray(documents).should.be.ok;
			documents.length.should.equal(1);
			documents[0].should.have.property("test");
			done();
		});
	});

	it("Model.insert() - with one document - should insert a single document", function (done) {
		Model.insert({ test: "document" }, function (err) {
			_.isNull(err).should.be.ok;

			Model.find(function (err, documents) {
				_.isArray(documents).should.be.ok;
				documents.length.should.equal(1);
				documents[0].should.have.property("test");
				done();
			});
		});
	});

	it("Model.insert() - with an Array of one document - should insert a single document", function (done) {
		Model.insert([ { test: "document" } ], function (err, documents) {
			_.isNull(err).should.be.ok;
			_.isArray(documents).should.be.ok;
			documents.length.should.equal(1);
			documents[0].should.have.property("test");
			done();
		});
	});

	it("Model.insert() - with an Array of two documents - should insert two documents", function (done) {
		Model.insert([ { test: "document" }, { test2: "document"} ], function (err, documents) {
			_.isNull(err).should.be.ok;
			_.isArray(documents).should.be.ok;
			documents.length.should.equal(2);
			done();
		});
	});
});