require("should");
var _ = require("underscore");
var sinon = require("sinon");
var Platos = require("../../lib/platos-model");

describe("UNIT - CREATION", function () {
	it("Platos.create() should return a function", function () {
		_.isFunction(Platos.create("Model")).should.be.ok;
	});
	
	it("new Platos.create() should return an object", function () {
		var Model = Platos.create("Model");
		_.isObject(new Model()).should.be.ok;
	});
	
	it("Model meta-properties should not be visible", function () {
		var Model = Platos.create("Model");
		var instance = new Model();
		
		_.isObject(instance).should.be.ok;
		instance.hasOwnProperty("_meta").should.not.be.ok;
	});
	
	it("new Model(properties) should return an object with passed in properties", function () {
		var Model = Platos.create("Model");
		var instance = new Model({ test: "property" });
		
		_.isObject(instance).should.be.ok;
		instance.should.have.property("test");
	});
	
	it("new Model(properties) with empty 'init' hook should call the hook and not modify object", function () {
		var Model = Platos.create("Model");
		var stub = sinon.stub();
		
		Model.pre("init", function (next, properties) {
			stub();
			next(properties);
		});
		
		stub.called.should.not.be.ok;
		var instance = new Model({ test: "property", test2: "property" });
		stub.called.should.be.ok;
		_.isObject(instance).should.be.ok;
		instance.should.have.property("test");
		instance.should.have.property("test2");
	});
	
	it("new Model(properties) with mutative hook should call the hook and remove one property", function () {
		var Model = Platos.create("Model");
		
		Model.pre("init", function (next, properties) {
			delete properties.test2;
			next(properties);
		});
		
		var instance = new Model({ test: "property", test2: "property" });
		_.isObject(instance).should.be.ok;
		instance.should.have.property("test");
		instance.should.not.have.property("test2");
	});
});