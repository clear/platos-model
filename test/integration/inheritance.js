require("should");
var _ = require("underscore");
var sinon = require("sinon");
var Platos = require("../../lib/platos-model");

describe("INTEGRATION - INHERITANCE", function () {
	var ParentModel, Model;

	beforeEach(function (done) {
		ParentModel = Platos.create("ParentModel");
		Model = Platos.create("Model");
		Model.inherits(ParentModel);

		Platos._db.collection("ParentModel").drop(function () {
			done();
		});
	});

	afterEach(function (done) {
		return done();
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

		it("model.save() - with three levels of inheritance - should save without errors", function (done) {
			var stub = sinon.stub();
			var Child = Platos.create("Child");

			Child.inherits(Model);

			var child = new Child({ inception: "not really" });

			child.save(function (err, document) {
				_.isNull(err).should.be.ok;
				document.should.have.property("inception");

				done();
			});
		});

		it("model.save() - with pre hook on parent and child - should call both hooks", function (done) {
			var stub = sinon.stub();
			var model = new Model();

			ParentModel.prototype.pre("save", function (next, callback) {
				stub.callCount.should.equal(1);
				stub();
				next(callback);
			});

			Model.prototype.pre("save", function (next, callback) {
				stub.callCount.should.equal(0);
				stub();
				next(callback);
			});

			model.save(function () {
				stub.callCount.should.equal(2);
				done();
			});
		});

		it("model.save() - with three levels of inheritance and pre hooks on all - should call all hooks", function (done) {
			var stub = sinon.stub();
			var Child = Platos.create("Child");

			Child.inherits(Model);

			var child = new Child();

			ParentModel.prototype.pre("save", function (next, callback) {
				stub.callCount.should.equal(2);
				stub();
				next(callback);
			});

			Model.prototype.pre("save", function (next, callback) {
				stub.callCount.should.equal(1);
				stub();
				next(callback);
			});

			Child.prototype.pre("save", function (next, callback) {
				stub.callCount.should.equal(0);
				stub();
				next(callback);
			});

			child.save(function () {
				stub.callCount.should.equal(3);
				done();
			});
		});

		it.only("model.save() - with three levels of inheritance and pre hooks on all - each pre hook should access properties", function (done) {
			var Child = Platos.create("Child");

			Child.inherits(Model);

			var child = new Child({ important: "property"});

			ParentModel.prototype.pre("save", function (next, callback) {
				this.should.have.property("important");
				next(callback);
			});
			
			Model.prototype.pre("save", function (next, callback) {
				this.should.have.property("important");
				next(callback);
			});

			Child.prototype.pre("save", function (next, callback) {
				this.should.have.property("important");
				next(callback);
			});

			child.save(function (err, document) {
				document.should.have.property("important");
				done();
			});
		});

		it("model.save() - with pre hook parent and different child - should only call the parent hook", function (done) {
			var Model2 = Platos.create("Model2");
			var stub = sinon.stub();
			var model = new Model();

			Model2.inherits(ParentModel);

			ParentModel.prototype.pre("save", function (next, callback) {
				stub.callCount.should.equal(0);
				stub();
				next(callback);
			});

			Model2.prototype.pre("save", function (next, callback) {
				stub();
				next(callback);
			});

			model.save(function () {
				stub.callCount.should.equal(1);
				done();
			});
		});

		it("model.save() - with pre hook on parent and late-bound inherited child - should call both hooks", function (done) {
			var stub = sinon.stub();
			var ParentModelEarly = Platos.create("ParentModelEarly", "ParentModel");

			ParentModelEarly.prototype.pre("save", function (next, callback) {
				stub.callCount.should.equal(1);
				stub();
				next(callback);
			});

			var ModelLate = Platos.create("ModelLate");

			//Note that the model is inherited after parent hooks have been defined
			ModelLate.inherits(ParentModelEarly);

			ModelLate.prototype.pre("save", function (next, callback) {
				stub.callCount.should.equal(0);
				stub();
				next(callback);
			});

			var model = new ModelLate();

			model.save(function () {
				stub.callCount.should.equal(2);
				done();
			});
		});

		it("model.save() - with pre hook on parent but different late-bound inherited child - should only call the parent hook", function (done) {
			var stub = sinon.stub();
			var ParentModelEarly = Platos.create("ParentModelEarly", "ParentModel");

			ParentModelEarly.prototype.pre("save", function (next, callback) {
				stub.callCount.should.equal(0);
				stub();
				next(callback);
			});

			var ModelLate = Platos.create("ModelLate");
			var ModelLate2 = Platos.create("ModelLate2");

			//Note that the model is inherited after parent hooks have been defined
			ModelLate.inherits(ParentModelEarly);
			ModelLate2.inherits(ParentModelEarly);

			ModelLate2.prototype.pre("save", function (next, callback) {
				stub();
				next(callback);
			});

			var model = new ModelLate();

			model.save(function () {
				stub.callCount.should.equal(1);
				done();
			});
		});

		describe("custom collections", function () {
			var CustomParentModel;
			var CustomModel;

			before(function () {
				CustomParentModel = Platos.create("CustomParentModel");
				CustomModel = Platos.create("Model", "ParentModel");

				Model.inherits(ParentModel);
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