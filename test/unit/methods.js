require("should");
var _ = require("underscore");
var util = require("util");
var sinon = require("sinon");
var Model = require("../../lib/platos-model");

/*
	Rationale: Models aren"t object schemas, they"re a distinct layer
	for handling all domain-level logic. Developers should be able to
	define methods on a Model without them being stored in the database.
*/
describe("UNIT - METHODS", function () {
	it("instance.method() should exist when instantiated from Class with custom 'method()'", function () {
		var Class = Model.create("Class");
		Class.prototype.method = sinon.stub().returns("Like a tomato in the rain");
		
		var instance = new Class();
		
		_.isFunction(instance.method).should.be.ok;
		instance.method().should.equal("Like a tomato in the rain");
	});
	
	it("instance.method() should exist on children inheriting from ParentClass with custom 'method()'", function () {
		var ParentClass = Model.create("ParentClass");
		ParentClass.prototype.method = sinon.stub().returns("I got that feeling again");

		var Class = Model.create("Class");
		util.inherits(Class, ParentClass);

		var instance = new Class();

		_.isFunction(instance.method).should.be.ok;
		instance.method().should.equal("I got that feeling again");
	});
});