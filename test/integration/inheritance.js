require("should");
var _ = require("underscore");
var util = require("util");
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

	it("model.save() - with 1 parent instance and 1 child instance - should save without errors", function (done) {
		var parent = new ParentModel({ parent: "Why won't they..." });
		var model = new Model({ child: "talk to me?" });

		parent.save(function (err, document) {
			_.isNull(err).should.be.ok;
			document.should.have.property("parent");
			
			model.save(function (err, document) {
				_.isNull(err).should.be.ok;
				document.should.have.property("child");

				done();
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

		it("Model.find() - on parent with 1 parent instance and 1 child instance - instances should be correct types", function (done) {
			ParentModel.find(function (err, models) {
				models[0]._meta.name.should.equal("ParentModel");
				models[1]._meta.name.should.equal("Model");

				done();
			});
		});
	});
});