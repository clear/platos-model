require('should');
var _ = require('underscore');
var Model = require('../../lib/platos-model');

describe('INTEGRATION - REMOVE', function () {
	var Class, instance, instance2;
	
	beforeEach(function (done) {
		//Insert a document into the database to test finding
		Model._db.collection('Class').drop(function () {
			Class = Model.create('Class');
			instance = new Class();
			instance.test = 'property';

			instance.save(function () {
				instance2 = new Class({ test: 'property', test2: 'property2' });
				instance2.save(done);
			});
		});
	});
	
	afterEach(function (done) {
		Model._db.collection('Class').drop(done);
	});
	
	describe('static method', function () {
		it("Class.remove() should remove all documents", function (done) {
			Class.remove(function (err) {
				_.isNull(err).should.be.ok;

				//Ensure removed
				Class.find(function (err, objects) {
					objects.length.should.equal(0);
					done();
				});
			});
		});

		it("Class.remove({ test2: 'property2' }) should remove one document and leave the other", function (done) {
			Class.remove({ test2: 'property2' }, function (err) {
				_.isNull(err).should.be.ok;

				//Ensure removed
				Class.find(function (err, objects) {
					objects.length.should.equal(1);
					objects[0]._id.equals(instance._id).should.be.ok;
					done();
				});
			});
		});
		
		it("Class.remove({ missing: 'property' }) should not remove any documents", function (done) {
			Class.remove({ test2: 'property' }, function (err) {
				_.isNull(err).should.be.ok;

				//Ensure removed
				Class.find(function (err, objects) {
					objects.length.should.equal(2);
					done();
				});
			});
		});
	});
	
	describe('instance method', function () {
		it("instance.remove() should remove the document called on", function (done) {
			instance.remove(function (err) {
				_.isNull(err).should.be.ok;

				//Ensure removed
				Class.find(function (err, objects) {
					objects.length.should.equal(1);
					objects[0]._id.equals(instance2._id).should.be.ok;
					done();
				});
			});
		});
	});
});