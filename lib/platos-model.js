var mongojs = require("mongojs");
var hooks = require("hooks");

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
	
	model.prototype.save = function (callback) {
		//Interestingly I thought I"d have to use the callback to add _id to model but it looks
		//like this is passed in as a reference and Mongojs handles that automatically.
		Platos._db.collection(this._meta.name).save(this, callback);
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
		Class: find([query], callback(err, object))
		Retrieves all instances of Model matching **query**, if query is not defined then
		retrieves all instances of Model that exist.
	*/
	model.find = function () {
		var collection = Platos._db.collection(model._meta.name);
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