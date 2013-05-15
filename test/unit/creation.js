require('should');
var _ = require('underscore');
var sinon = require('sinon');
var Model = require('../../lib/platos-model');

describe('UNIT - CREATION', function () {
	/*
		For the below tests, assume:
		'Model' is the package
		'Class' is the object created after Model.create('Class') is called
		'instance' is thw new object created after new Class() is called
	*/
	it("Model.create() should return a function", function () {
		_.isFunction(Model.create('Class')).should.be.ok;
	});
	
	it("new Model.create() should return an object", function () {
		var Class = Model.create('Class');
		_.isObject(new Class()).should.be.ok;
	});
	
	it("Model meta-properties should not be visible", function () {
		var Class = Model.create('Class');
		var instance = new Class();
		
		_.isObject(instance).should.be.ok;
		instance.hasOwnProperty('_meta').should.not.be.ok;
	});
	
	it("new Class(properties) should return an object with passed in properties", function () {
		var Class = Model.create('Class');
		var instance = new Class({ test: 'property' });
		
		_.isObject(instance).should.be.ok;
		instance.should.have.property('test');
	});
	
	it("Class.validate(callback) should call the callback during creation", function () {
		var Class = Model.create('Class');
		var callback = sinon.spy();
		Class.validate(callback);
		
		callback.called.should.not.be.ok;
		new Class();
		callback.called.should.be.ok;
	});
	
	it("new Class(properties) when validation passes should return an object with passed in properties", function () {
		var Class = Model.create('Class');
		var stub = sinon.stub().callsArg(1);
		Class.validate(stub);
		var instance = new Class({ test: 'property' });
		
		_.isObject(instance).should.be.ok;
		instance.should.have.property('test');
	});
	
	it("new Class(properties) when validation completly fails should return an object without passed in properties", function () {
		var Class = Model.create('Class');
		var stub = sinon.stub().callsArgWith(1, 'error');
		Class.validate(stub);
		var instance = new Class({ test: 'property', test2: 'property' });
		
		_.isObject(instance).should.be.ok;
		instance.should.not.have.property('test');
		instance.should.not.have.property('test2');
	});
	
	it("new Class(properties) when validation partially fails should return an object with one passed in property", function () {
		var Class = Model.create('Class');
		var stub = sinon.stub().callsArgWith(1, 'error', { test2: 'property' });
		Class.validate(stub);
		var instance = new Class({ test: 'property', test2: 'property' });
		
		_.isObject(instance).should.be.ok;
		instance.should.not.have.property('test');
		instance.should.have.property('test2');
	});
});