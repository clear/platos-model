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
	it("instance.method() - when instantiated from Class with custom 'method()' - should contain 'method' function", function () {
		var Model = Platos.create("Model");
		Model.prototype.method = sinon.stub().returns("Like a tomato in the rain");
		
		var instance = new Model();
		
		_.isFunction(instance.method).should.be.ok;
		instance.method().should.equal("Like a tomato in the rain");
	});
	
	it("instance.method() - when child class of Parent class with custom 'method()' - should inherit 'method' function", function () {
		var ParentModel = Platos.create("ParentClass");
		ParentModel.prototype.method = sinon.stub().returns("I got that feeling again");

		var Model = Platos.create("Class");
		util.inherits(Model, ParentModel);

		var instance = new Model();

		_.isFunction(instance.method).should.be.ok;
		instance.method().should.equal("I got that feeling again");
	});
});