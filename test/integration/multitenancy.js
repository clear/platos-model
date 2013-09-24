require("should");
var _ = require("underscore");
var sinon = require("sinon");
var Platos = require("../../lib/platos-model");

describe("INTEGRATION - MULTITENANCY", function () {
	beforeEach(function (done) {
		Platos._db.collection("Model").drop(function () {
			Platos._db.collection("tenant.Model").drop(function () {
				done();
			});
		});
	});
	
	describe("save", function () {
		it("model.save() - with tenant - should save to a tenant-specific collection", function (done) {
			var Model = Platos.create("Model");
			var tenant = new Model({ tenant: "property" });

			tenant.save("tenant", function (err, document) {
				_.isNull(err).should.be.ok;
				document.should.have.property("tenant");
				
				done();
			});
		});
		
		it("model.save() - with tenant - should be separate to global save", function (done) {
			var Model = Platos.create("Model");
			var global = new Model({ global: "property" });
			var tenant = new Model({ tenant: "property" });

			global.save(function (err) {
				_.isNull(err).should.be.ok;

				tenant.save("tenant", function (err) {
					_.isNull(err).should.be.ok;

					//Find back
					Model.find(function (err, documents) {
						_.isNull(err).should.be.ok;
						documents.length.should.equal(1);
						documents[0].should.have.property("global");
						documents[0].should.not.have.property("tenant");

						Model.find("tenant", function (err, documents) {
							_.isNull(err).should.be.ok;
							documents.length.should.equal(1);
							documents[0].should.have.property("tenant");
							documents[0].should.not.have.property("global");

							done();
						});
					});
				});
			});
		});
	});
	
	describe("find", function () {
		var Model;
		
		beforeEach(function (done) {
			Model = Platos.create("Model");
			var tenant = new Model({ tenant: "property" });
			
			tenant.save("tenant", function () {
				done();
			});
		});
		
		it("Model.find() - with tenant - should retrieve document from a tenant-specific collection", function (done) {
			var Model = Platos.create("Model");

			Model.find("tenant", function (err, documents) {
				_.isNull(err).should.be.ok;
				documents.length.should.equal(1);
				documents[0].should.have.property("tenant");

				done();
			});
		});

		it("Model.find() - with tenant and pre() hook - should call retrieved() hook", function (done) {
			var stub = sinon.stub();
			
			Model.prototype.pre("retrieved", function (next) {
				stub.callCount.should.equal(0);
				stub();
				next();
			});
			
			Model.find("tenant", function () {
				stub.callCount.should.equal(1);
				done();
			});
		});

		it("Model.find() - with tenant and pre() hook - should pass tenant value to retrieved() hook", function (done) {
			Model.prototype.pre("retrieved", function (next, tenant) {
				tenant.should.equal("tenant");
				
				next(tenant);
				done();
			});
			
			Model.find("tenant", function () { });
		});
	});
	
	describe("remove", function () {
		var Model;
		var instance;
		
		beforeEach(function (done) {
			//Insert tenant-specific data to test removal
			Model = Platos.create("Model");
			instance = new Model({ test: "property" });
			instance.save("tenant", done);
		});
	
		it("static Model.remove() - with tenant - should remove the document from the tenant-specific collection", function (done) {
			Model.remove("tenant", function (err) {
				_.isNull(err).should.be.ok;
				
				//Ensure removed
				Model.find("tenant", function (err, objects) {
					objects.length.should.equal(0);
					done();
				});
			});
		});
		
		it("instance Model.remove() - with tenant - should remove the document from the tenant-specific collection", function (done) {
			instance.remove("tenant", function (err) {
				_.isNull(err).should.be.ok;
				
				//Ensure removed
				Model.find("tenant", function (err, objects) {
					objects.length.should.equal(0);
					done();
				});
			});
		});
	});
});