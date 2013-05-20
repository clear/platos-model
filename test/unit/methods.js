require("should");
var _ = require("underscore");
var util = require("util");
var sinon = require("sinon");
var Platos = require("../../lib/platos-model");

/*
	Rationale: Models aren't object schemas, they're a distinct layer
	for handling all domain-level logic. Developers should be able to
	define methods on a Model without them being stored in the database.
*/
describe("UNIT - METHODS", function () {
	it("instance.method() should exist when instantiated from Class with custom 'method()'", function () {
		var Model = Platos.create("Model");
		Model.prototype.method = sinon.stub().returns("Like a tomato in the rain");
		
		var instance = new Model();
		
		_.isFunction(instance.method).should.be.ok;
		instance.method().should.equal("Like a tomato in the rain");
	});
	
	it("instance.method() should exist on children inheriting from ParentClass with custom 'method()'", function () {
		var ParentModel = Platos.create("ParentClass");
		ParentModel.prototype.method = sinon.stub().returns("I got that feeling again");

		var Model = Platos.create("Class");
		util.inherits(Model, ParentModel);

		var instance = new Model();

		_.isFunction(instance.method).should.be.ok;
		instance.method().should.equal("I got that feeling again");
	});
});