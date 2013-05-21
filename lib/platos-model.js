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
	var Model = function (properties) {
		//Use a separate function to trigger hooks
		this.init(properties);
	};
		
	//INSTANCE
	//Default options are inherited from Platos
	Model.prototype._meta = {
		name: name
	};
	
	Model.prototype.init = function (properties) {
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
	Model.prototype.save = function () {
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
	
	Model.prototype.remove = function () {
		//Simply re-route to static method
		if (arguments.length === 2)
			Model.remove(arguments[0], { _id: this._id }, arguments[1]);
		else if (arguments.length === 1)
			Model.remove({ _id: this._id }, arguments[0]);
	};
	
	
	//STATIC
	Model._meta = {
		name: name
	};
	
	//Add hooks
	for (var key in hooks)
		Model[key] = hooks[key];
	
	Model.create = function (callback) {
		callback();
	};

	/*
		Class: find([tenant], [query], callback(err, object))
		Retrieves all instances of Model matching **query**, if query is not defined then
		retrieves all instances of Model that exist.
	*/
	Model.find = function () {
		var collection;
		var args = arguments;
		
		//For tenants, find specific collection and remove the first argument
		if (arguments.length > 0 && _.isString(arguments[0])) {
			collection = Platos._db.collection(arguments[0] + Platos._options.separator + this._meta.name);
			args = _.rest(arguments);
		} else {
			collection = Platos._db.collection(Model._meta.name);
		}
		
		//Wrap callback so we can intercept the returned objects and convert them to this Model
		args[args.length - 1] = _.wrap(_.last(args), function (original, err, objects) {
			objects = objects.map(function (object) {
				return new Model(object);
			});
						
			original(err, objects);
		});
		
		collection.find.apply(collection, args);
	};
	
	/*
		Class: remove([tenant], [query], callback(err, object))
		Removes all instances of Model matching **query**, if query is not defined then
		completely removes all instances of Model.
	*/
	Model.remove = function () {
		var collection;
		var args = arguments;
		
		//For tenants, find specific collection and remove the first argument
		if (arguments.length > 0 && _.isString(arguments[0])) {
			collection = Platos._db.collection(arguments[0] + Platos._options.separator + this._meta.name);
			args = _.rest(arguments);
		} else {
			collection = Platos._db.collection(Model._meta.name);
		}
		
		collection.remove.apply(collection, args);
	};

	return Model;
};