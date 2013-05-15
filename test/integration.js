require('should');
var _ = require('underscore');
var Model = require('../lib/platos-model');

describe('INTEGRATION', function () {
	before(function () {
		Model.connect('platos-model-test');
	});
	
	it("Class.save() with no properties should save a document with only _id", function (done) {
		var Class = Model.create('Class');
		var instance = new Class();
		
		instance.save(function (err, document) {
			_.isNull(err).should.be.ok;
			_.size(document).should.equal(1);
			document.should.have.property('_id');

			done();
		});
		
	});
	
	after(function (done) {
		Model._db.dropDatabase(function () {
			done();
		});
	});
});