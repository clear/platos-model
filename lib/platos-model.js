var mongojs = require("mongojs");
var hooks = require("hooks");

var Model = function () { };

module.exports = Model;

//Connect to database
Model.connect = function (database) {
	Model._db = mongojs(database);
};

//Creates a class with obfuscated metadata and instance methods
Model.create = function (name) {
	var model = function (properties) {
		//Use a separate function to trigger hooks
		this.init(properties);
	};
		
	//INSTANCE
	model.prototype._meta = {
		name: name
	};
	
	model.prototype.init = function (properties) {
		//Shallow copy
		for (var key in properties)
			this[key] = properties[key];
	};
	
	model.prototype.save = function (callback) {
		//Interestingly I thought I"d have to use the callback to add _id to model but it looks
		//like this is passed in as a reference and Mongojs handles that automatically.
		Model._db.collection(this._meta.name).save(this, callback);
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
		var collection = Model._db.collection(model._meta.name);
		collection.find.apply(collection, arguments);
	};
	
	/*
		Class: remove([query], callback(err, object))
		Removes all instances of Model matching **query**, if query is not defined then
		completely removes all instances of Model.
	*/
	model.remove = function () {
		var collection = Model._db.collection(model._meta.name);
		collection.remove.apply(collection, arguments);
	};

	return model;
};