require("should");
var _ = require("underscore");
var Platos = require("../../lib/platos-model");

describe("INTEGRATION - UPDATE", function () {
	var Model = Platos.create("Model");
	var instance;
	
	beforeEach(function (done) {
		//Insert one document into the database to test updating against
		Platos._db.collection("Model").drop(function () {
			instance = new Model();
			instance.test = "property";

			instance.save(done);
		});
	});
	
	afterEach(function (done) {
		Platos._db.collection("Model").drop(done);
	});
	
	describe("model.save()", function () {
		it("second call should update document (_id will remain the same)", function (done) {
			var _id = instance._id;
			_id.should.be.ok;
		
			instance.save(function (err) {
				_.isNull(err).should.be.ok;
				instance._id.should.equal(_id);
			
				done();
			});
		});
	
		it("second call should update existing property", function (done) {
			instance.test = "property2";
		
			instance.save(function () {
				_.size(instance).should.equal(2);
				instance.should.have.property("test");
				instance.test.should.equal("property2");
			
				done();
			});
		});
	
		it("second call should keep existing property and add new", function (done) {
			instance.test2 = "property2";
		
			instance.save(function () {
				_.size(instance).should.equal(3);
				instance.should.have.property("test");
				instance.test.should.equal("property");
				instance.should.have.property("test2");
				instance.test2.should.equal("property2");
			
				done();
			});
		});
	});
	
	describe("instance method", function () {
		it("model.update() from existing Model should update document without inserting another", function (done) {
			var _id = instance._id;
			instance.test2 = "property2";
					
			instance.update([ "test" ], function (err) {
				_.isNull(err).should.be.ok;
				
				//Re-find
				Model.find(function (err, objects) {
					_.isNull(err).should.be.ok;
					_.isArray(objects).should.be.ok;
					objects.length.should.equal(1);
					objects[0]._id.equals(_id).should.be.ok;
					objects[0].should.have.property("test");
					objects[0].should.have.property("test2");
					
					done();
				});
			});
		});
		
		it("model.update() from new Model should update document without inserting another", function (done) {
			var _id = instance._id;
			var newInstance = new Model({ test: "property", test2: "property2" });
		
			newInstance.update([ "test" ], function (err) {
				_.isNull(err).should.be.ok;
				
				//Re-find
				Model.find(function (err, objects) {
					_.isNull(err).should.be.ok;
					_.isArray(objects).should.be.ok;
					objects.length.should.equal(1);
					objects[0]._id.equals(_id).should.be.ok;
					objects[0].should.have.property("test");
					objects[0].should.have.property("test2");
					
					done();
				});
			});
		});
	});
	
	describe("static method", function () {
		it("Model.update() should update document without inserting another", function (done) {
			var _id = instance._id;
			_id.should.be.ok;
		
			Model.update({ _id: _id }, { $set: { test2: "property2" } }, function (err) {
				_.isNull(err).should.be.ok;
				
				//Re-find
				Model.find(function (err, objects) {
					_.isNull(err).should.be.ok;
					_.isArray(objects).should.be.ok;
					objects.length.should.equal(1);
					objects[0]._id.equals(_id).should.be.ok;
					objects[0].should.have.property("test");
					objects[0].should.have.property("test2");
					
					done();
				});
			});
		});
	});
});