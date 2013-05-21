var mongojs = require("mongojs");
var hooks = require("hooks");
var _ = require("underscore");

var Platos = function () { };

module.exports = Platos;

//Connect to database
Platos.connect = function (database, options) {
	Platos._db = mongojs(database);
	Platos._options = options || { };
	
	//Default options
	Platos._options.separator = Platos._options.separator || '.';
};

//Creates a class with obfuscated metadata and instance methods
Platos.create = function (name) {
	var model = function (properties) {
		//Use a separate function to trigger hooks
		this.init(properties);
	};
		
	//INSTANCE
	//Default options are inherited from Platos
	model.prototype._meta = {
		name: name
	};
	
	model.prototype.init = function (properties) {
		if (properties === undefined)
			return;
		
		//Shallow copy
		Object.keys(properties).forEach(function (key) {
			this[key] = properties[key];
		}, this);
	};
	
	/*
		Class: save([tenant], callback(err, object))
		Saves the current state of the model to the database.
	*/
	model.prototype.save = function () {
		var collection;
		var callback;
		
		//Tenant or global collection?
		if (arguments.length === 2) {
			collection = Platos._db.collection(arguments[0] + Platos._options.separator + this._meta.name);
			callback = arguments[1];
		} else if (arguments.length < 2) {
			collection = Platos._db.collection(this._meta.name);
			callback = arguments[0];
		}		
		
		//Interestingly I thought I'd have to use the callback to add _id to model but it looks
		//like 'this' is passed in as a reference and Mongojs handles that automatically.
		collection.save(this, callback);
	};
	
	model.prototype.remove = function (callback) {
		//Simply re-route to static method
		model.remove({ _id: this._id }, callback);
	};
	
	
	//STATIC
	model._meta = {
		name: name
	};
	
	//Add hooks
	for (var key in hooks)
		model[key] = hooks[key];
	
	model.create = function (callback) {
		callback();
	};

	/*
		Class: find([tenant], [query], callback(err, object))
		Retrieves all instances of Model matching **query**, if query is not defined then
		retrieves all instances of Model that exist.
	*/
	model.find = function () {
		var collection;
		
		//For tenants, find specific collection and remove the first argument
		if (arguments.length > 0 && _.isString(arguments[0])) {
			collection = Platos._db.collection(arguments[0] + Platos._options.separator + this._meta.name);
			arguments = _.rest(arguments);
		} else {
			collection = Platos._db.collection(model._meta.name);
		}
		
		collection.find.apply(collection, arguments);
	};
	
	/*
		Class: remove([query], callback(err, object))
		Removes all instances of Model matching **query**, if query is not defined then
		completely removes all instances of Model.
	*/
	model.remove = function () {
		var collection = Platos._db.collection(model._meta.name);
		collection.remove.apply(collection, arguments);
	};

	return model;
};