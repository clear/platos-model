require("should");
var _ = require("underscore");
var Platos = require("../../lib/platos-model");

describe("INTEGRATION - MULTITENANCY", function () {
	beforeEach(function (done) {
		Platos._db.dropDatabase(done);
	});
	
	afterEach(function (done) {
		Platos._db.dropDatabase(done);
	});
	
	it("model.save('tenant') and model.find('tenant') should save and retrieve tenant-specific documents", function (done) {
		var Model = Platos.create("Model");
		var tenant = new Model({ tenant: "property" });
		
		tenant.save('tenant', function (err, document) {
			_.isNull(err).should.be.ok;
			document.should.have.property("tenant");
			
			//Find back
			Model.find("tenant", function (err, documents) {
				_.isNull(err).should.be.ok;
				documents.length.should.equal(1);
				documents[0].should.have.property("tenant");
				
				done();
			});
		});
	});

	it("model.save('tenant') should be separate to global save", function (done) {
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