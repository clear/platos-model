require("should");
var sinon = require("sinon");
var Platos = require("../../lib/platos-model");

describe("INTEGRATION - RETRIEVED", function () {
	describe("single instance", function () {
		var Model;
	
		before(function (done) {
			//Insert one document into the database to test updating against
			Platos._db.collection("Model").drop(function () {
				Model = Platos.create("Model");
			
				var instance = new Model({ test: "property" });
				instance.save(done);
			});
		});
	
		after(function (done) {
			Platos._db.collection("Model").drop(done);
		});
	
		it("Model.find() - when one instance exists - should call model.retrieved() once", function (done) {
			var spy = sinon.spy();
			
			Model.prototype.retrieved = function (callback) {
				spy();
				callback();
			};
			
			Model.find(function () {
				spy.calledOnce.should.be.ok;
				done();
			});
		});
		
		it("Model.find().sort() - when one instance exists - should call model.retrieved() once", function (done) {
			var spy = sinon.spy();
			
			Model.prototype.retrieved = function (callback) {
				spy();
				callback();
			};
			
			Model.find().sort(function () {
				spy.calledOnce.should.be.ok;
				done();
			});
		});
		
		it("Model.find() - when one instance exists and pre() hook - should call retrieved() hook", function (done) {
			var stub = sinon.stub();
			
			Model.prototype.pre("retrieved", function (next) {
				stub.callCount.should.equal(0);
				stub();
				next();
			});
			
			Model.find(function () {
				stub.callCount.should.equal(1);
				done();
			});
		});
	});
	
	describe("multiple instances", function () {
		var Model;
		
		beforeEach(function (done) {
			//Insert a document into the database to test finding
			Platos._db.collection("Model").drop(function () {
				Model = Platos.create("Model");
				
				var instance = new Model();
				instance.test = "property";

				instance.save(function () {
					var instance2 = new Model({ test: "property", test2: "property2" });
					instance2.save(done);
				});
			});
		});
	
		after(function (done) {
			Platos._db.collection("Model").drop(done);
		});
	
		it("Model.find() - when two instances exists - should call model.retrieved() twice", function (done) {
			var spy = sinon.spy();
			
			Model.prototype.retrieved = function (callback) {
				spy();
				callback();
			};
			
			Model.find(function () {
				spy.calledTwice.should.be.ok;
				done();
			});
		});
	});
});