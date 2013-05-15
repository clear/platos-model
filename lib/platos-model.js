var mongojs = require('mongojs');

var Model = function () { };

module.exports = Model;

//Connect to database
Model.connect = function (database) {
	Model._db = mongojs(database);
};

//Creates a class with obfuscated metadata and instance methods
Model.create = function (name) {
	var model = function (properties) {
		var self = this;
		
		//(Callback) arguments should be
		//Success - Callback() - accepts all properties
		//All Failed - Callback(error) - error
		//Partial Failed - Callback(error, accepted) - error, and accepted properties
		this._meta.validate(properties, function () {
			if (arguments.length === 1)
				return;
			else if (arguments.length === 2)
				properties = arguments[1];
			
			//Shallow copy
			for (var key in properties)
				self[key] = properties[key];
		});
	};
	
	//INSTANCE
	model.prototype._meta = {
		name: name,
		validate: function (properties, callback) { callback(); }	//Default validate() method always passes
	};
	
	model.prototype.save = function (callback) {
		//Interestingly I thought I'd have to use the callback to add _id to model but it looks
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
	
	model.validate = function (callback) {
		model.prototype._meta.validate = callback;
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