require('should');
var _ = require('underscore');
var Model = require('../../lib/platos-model');

describe('INTEGRATION - UPDATE', function () {
	var instance;
	
	beforeEach(function (done) {
		//Insert one document into the database to test updating against
		Model._db.collection('Class').drop(function () {
			var Class = Model.create('Class');
			instance = new Class();
			instance.test = 'property';

			instance.save(done);
		});
	});
	
	afterEach(function (done) {
		Model._db.collection('Class').drop(done);
	});
	
	it("Class.save() second call should update document (_id will remain the same)", function (done) {
		var _id = instance._id;
		_id.should.be.ok;
		
		instance.save(function (err) {
			_.isNull(err).should.be.ok;
			instance._id.should.equal(_id);
			
			done();
		});
	});
	
	it("Class.save() second call should update existing property", function (done) {
		instance.test = 'property2';
		
		instance.save(function () {
			_.size(instance).should.equal(2);
			instance.should.have.property('test');
			instance.test.should.equal('property2');
			
			done();
		});
	});
	
	it("Class.save() second call should keep existing property and add new", function (done) {
		instance.test2 = 'property2';
		
		instance.save(function () {
			_.size(instance).should.equal(3);
			instance.should.have.property('test');
			instance.test.should.equal('property');
			instance.should.have.property('test2');
			instance.test2.should.equal('property2');
			
			done();
		});
	});
});