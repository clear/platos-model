require("should");
var _ = require("underscore");
var sinon = require("sinon");
var Model = require("../../lib/platos-model");

describe("UNIT - CREATION", function () {
	/*
		For the below tests, assume:
		"Model" is the package
		"Class" is the object created after Model.create("Class") is called
		"instance" is the new object created after new Class() is called
	*/
	it("Model.create() should return a function", function () {
		_.isFunction(Model.create("Class")).should.be.ok;
	});
	
	it("new Model.create() should return an object", function () {
		var Class = Model.create("Class");
		_.isObject(new Class()).should.be.ok;
	});
	
	it("Model meta-properties should not be visible", function () {
		var Class = Model.create("Class");
		var instance = new Class();
		
		_.isObject(instance).should.be.ok;
		instance.hasOwnProperty("_meta").should.not.be.ok;
	});
	
	it("new Class(properties) should return an object with passed in properties", function () {
		var Class = Model.create("Class");
		var instance = new Class({ test: "property" });
		
		_.isObject(instance).should.be.ok;
		instance.should.have.property("test");
	});
	
	it("new Class(properties) with empty 'init' hook should call the hook and not modify object", function () {
		var Class = Model.create("Class");
		var stub = sinon.stub();
		
		Class.pre("init", function (next, properties) {
			stub();
			next(properties);
		});
		
		stub.called.should.not.be.ok;
		var instance = new Class({ test: "property", test2: "property" });
		stub.called.should.be.ok;
		_.isObject(instance).should.be.ok;
		instance.should.have.property("test");
		instance.should.have.property("test2");
	});
	
	it("new Class(properties) with mutative hook should call the hook and remove one property", function () {
		var Class = Model.create("Class");
		
		Class.pre("init", function (next, properties) {
			delete properties.test2;
			next(properties);
		});
		
		var instance = new Class({ test: "property", test2: "property" });
		_.isObject(instance).should.be.ok;
		instance.should.have.property("test");
		instance.should.not.have.property("test2");
	});
});