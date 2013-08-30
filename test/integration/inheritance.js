require("should");
var _ = require("underscore");
var util = require("util");
var sinon = require("sinon");
var Platos = require("../../lib/platos-model");

describe("INTEGRATION - INHERITANCE", function () {
	var ParentModel, Model;

	before(function (done) {
		ParentModel = Platos.create("ParentModel");
		Model = Platos.create("Model");
		util.inherits(Model, ParentModel);

		Platos._db.collection("ParentModel").drop(function () {
			done();
		});
	});

	afterEach(function (done) {
		Platos._db.collection("ParentModel").drop(done);
	});

	describe("save", function () {
		it("model.save() - with 1 parent instance and 1 child instance - should save without errors", function (done) {
			var parent = new ParentModel({ parent: "Why won't they..." });
			var model = new Model({ child: "talk to me?" });

			parent.save(function (err, document) {
				_.isNull(err).should.be.ok;
				document.should.have.property("parent");
				document.should.not.have.property("_model");
				
				model.save(function (err, document) {
					_.isNull(err).should.be.ok;
					document.should.have.property("child");
					document.should.not.have.property("_model");

					done();
				});
			});
		});

		it("model.save() - with pre hook on parent and child - should call both hooks", function (done) {
			var stub = sinon.stub();
			var model = new Model();

			ParentModel.pre("save", function (next, callback) {
				stub.callCount.should.equal(0);
				stub();
				next(callback);
			});

			Model.pre("save", function (next, callback) {
				stub.callCount.should.equal(1);
				stub();
				next(callback);
			});

			model.save(function () {
				stub.callCount.should.equal(2);

				//Cleanup
				ParentModel.removePre("save");
				Model.removePre("save");

				done();
			});
		});

		it("model.save() - with pre hook on parent and late-bound inherited child - should call both hooks", function (done) {
			var stub = sinon.stub();
			var ParentModelEarly = Platos.create("ParentModelEarly", "ParentModel");

			ParentModelEarly.pre("save", function (next, callback) {
				stub.callCount.should.equal(0);
				stub();
				next(callback);
			});

			var ModelLate = Platos.create("ModelLate");

			//Note that the model is inherited after parent hooks have been defined
			util.inherits(ModelLate, ParentModelEarly);

			ModelLate.pre("save", function (next, callback) {
				stub.callCount.should.equal(1);
				stub();
				next(callback);
			});

			var model = new ModelLate();

			model.save(function () {
				stub.callCount.should.equal(2);

				//Cleanup
				ParentModelEarly.removePre("save");
				ModelLate.removePre("save");

				done();
			});
		});

		describe("custom collections", function () {
			var CustomParentModel;
			var CustomModel;

			before(function () {
				CustomParentModel = Platos.create("CustomParentModel");
				CustomModel = Platos.create("Model", "ParentModel");

				//Model.inherits(ParentModel);
				util.inherits(Model, ParentModel);
			});

			it("model.save() - on child instance - should save to custom collection name", function (done) {
				var model = new CustomModel({ child: "Palm tree in the summer..." });

				model.save(function (err) {
					_.isNull(err).should.be.ok;

					Platos._db.collection("ParentModel").find(function (err, documents) {
						_.isNull(err).should.be.ok;
						_.isArray(documents).should.be.ok;
						documents.length.should.equal(1);
						documents[0].should.have.property("child");

						done();
					});
				});
			});
		});
	});

	describe("find", function () {
		beforeEach(function (done) {
			var parent = new ParentModel({ parent: "Why won't they..." });
			var model = new Model({ child: "talk to me?" });

			parent.save(function () {
				model.save(done);
			});
		});

		it("Model.find() - on parent with 1 parent instance and 1 child instance - should retrieve 2 instances", function (done) {
			ParentModel.find(function (err, models) {
				_.isNull(err).should.be.ok;
				models.length.should.equal(2);

				done();
			});
		});

		it("Model.find() - on parent with 1 parent instance and 1 child instance - instances should not contain metadata", function (done) {
			ParentModel.find(function (err, models) {
				_.isNull(err).should.be.ok;
				models[0].should.have.property("parent");
				models[1].should.have.property("child");
				models[0].should.not.have.property("_model");
				models[1].should.not.have.property("_model");

				done();
			});
		});

		it("Model.find() - on parent with 1 parent instance and 1 child instance - instances should be correct types", function (done) {
			ParentModel.find(function (err, models) {
				models[0]._meta.name.should.equal("ParentModel");
				models[1]._meta.name.should.equal("Model");

				done();
			});
		});
	});
});