require("should");
var _ = require("underscore");
var sinon = require("sinon");
var Platos = require("../../lib/platos-model");

describe("INTEGRATION - INSERT", function () {
	var Model = Platos.create("Model");
	
	beforeEach(function (done) {
		Platos._db.collection("Model").drop(function () {
			done();
		});
	});
	
	afterEach(function (done) {
		Platos._db.collection("Model").drop(done);
	});
	
	describe("documents", function () {
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

		it("Model.insert() - with single document and 'save' hook - should call the hook", function (done) {
			var stub = sinon.stub();

			Model.pre("save", function (next) {
				stub.callCount.should.equal(0);
				stub();
				next();
			});

			Model.insert({ hook: "test" }, function (err, documents) {
				//Cleanup
				Model.removePre("save");

				_.isNull(err).should.be.ok;
				_.isArray(documents).should.be.ok;
				documents.length.should.equal(1);
				stub.callCount.should.equal(1);
				done();
			});
		});
	});

	describe("instances", function () {
		it("Model.insert() - with a single instance - should insert a single document", function (done) {
			var instance = new Model({ first: "instance" });

			Model.insert(instance, function (err, documents) {
				_.isNull(err).should.be.ok;
				_.isArray(documents).should.be.ok;
				documents.length.should.equal(1);

				Model.find(function (err, documents) {
					_.isArray(documents).should.be.ok;
					documents.length.should.equal(1);
					documents[0].should.have.property("first");
					done();
				});
			});
		});

		it("Model.insert() - with a two instances - should insert two documents", function (done) {
			var instance = new Model({ first: "instance" });
			var instance2 = new Model({ second: "instance" });

			Model.insert([ instance, instance2 ], function (err, documents) {
				_.isNull(err).should.be.ok;
				_.isArray(documents).should.be.ok;
				documents.length.should.equal(2);

				Model.find(function (err, documents) {
					_.isArray(documents).should.be.ok;
					documents.length.should.equal(2);
					documents[0].should.have.property("first");
					documents[1].should.have.property("second");
					done();
				});
			});
		});

		it("Model.insert() - with single instance and 'save' hook - should call the hook", function (done) {
			var stub = sinon.stub();

			Model.pre("save", function (next) {
				stub.callCount.should.equal(0);
				stub();
				next();
			});

			Model.insert(new Model({ hook: "test" }), function (err, documents) {
				//Cleanup
				Model.removePre("save");

				_.isNull(err).should.be.ok;
				_.isArray(documents).should.be.ok;
				documents.length.should.equal(1);
				stub.callCount.should.equal(1);
				done();
			});
		});

		it("Model.insert() - with two instances and 'save' hook - should call hook twice", function (done) {
			var stub = sinon.stub();

			Model.pre("save", function (next) {
				stub();
				next();
			});

			Model.insert([ new Model({ hook: "test" }), new Model({ hook: "test2" }) ], function (err, documents) {
				//Cleanup
				Model.removePre("save");

				_.isNull(err).should.be.ok;
				_.isArray(documents).should.be.ok;
				documents.length.should.equal(2);
				stub.callCount.should.equal(2);
				done();
			});
		});
	});
});