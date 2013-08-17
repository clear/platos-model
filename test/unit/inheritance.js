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
describe("UNIT - INHERITANCE", function () {
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

	it("instance.method() - when child class has custom 'method()' - should retain 'method' function", function () {
		var ParentModel = Platos.create("ParentClass");
		var Model = Platos.create("Class");
		util.inherits(Model, ParentModel);

		Model.prototype.method = sinon.stub().returns("All on my own");

		var parent = new ParentModel();
		var instance = new Model();

		_.isFunction(parent.method).should.not.be.ok;
		_.isFunction(instance.method).should.be.ok;
		instance.method().should.equal("All on my own");
	});

	it("util.inherits() - when used on two Models - should let each Model's instances retain their metadata name", function () {
		var ParentModel = Platos.create("ParentClass");
		var Model = Platos.create("Class");
		util.inherits(Model, ParentModel);

		var parent = new ParentModel();
		var model = new Model();

		ParentModel._meta.name.should.equal("ParentClass");
		parent._meta.name.should.equal("ParentClass");
		Model._meta.name.should.equal("Class");
		model._meta.name.should.equal("Class");
	});

	it("util.inherits() - when used on two Models - should overwrite a child Model's metadata collection with its parent's", function () {
		var ParentModel = Platos.create("ParentClass");
		var Model = Platos.create("Class");
		util.inherits(Model, ParentModel);

		var parent = new ParentModel();
		var model = new Model();

		ParentModel._meta.collection.should.equal("ParentClass");
		parent._meta.collection.should.equal("ParentClass");
		Model._meta.collection.should.equal("ParentClass");
		model._meta.collection.should.equal("ParentClass");
	});

	it("util.inherits() - when used on two Models and the Parent is never instantiated - should overwrite a child Model's metadata collection with its parent's", function () {
		var ParentModel = Platos.create("ParentClass");
		var Model = Platos.create("Class");
		util.inherits(Model, ParentModel);

		var model = new Model();

		ParentModel._meta.collection.should.equal("ParentClass");
		Model._meta.collection.should.equal("ParentClass");
		model._meta.collection.should.equal("ParentClass");
	});

	it("util.inherits() - when used on two Models and collection is explicitly set on the parent - should use the specified collection for the both Models", function () {
		var ParentModel = Platos.create("ParentClass", "Collection");
		var Model = Platos.create("Class");
		util.inherits(Model, ParentModel);

		var parent = new ParentModel();
		var model = new Model();

		ParentModel._meta.collection.should.equal("Collection");
		parent._meta.collection.should.equal("Collection");
		Model._meta.collection.should.equal("Collection");
		model._meta.collection.should.equal("Collection");
	});

	it("util.inherits() - when used on two Models and collection is explicitly set on the child - should use the specified collection for the child Model", function () {
		var ParentModel = Platos.create("ParentClass");
		var Model = Platos.create("Class", "Collection");
		util.inherits(Model, ParentModel);

		var parent = new ParentModel();
		var model = new Model();

		ParentModel._meta.collection.should.equal("ParentClass");
		parent._meta.collection.should.equal("ParentClass");
		Model._meta.collection.should.equal("Collection");
		model._meta.collection.should.equal("Collection");
	});
});