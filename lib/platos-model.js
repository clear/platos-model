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
	
	//Instance metadata
	model.prototype._meta = {
		name: name,
		validate: function (properties, callback) { callback(); }	//Default validate() method always passes
	};
	
	//Instance methods
	model.prototype.save = function (callback) {
		//Interestingly I thought I'd have to use the callback to add _id to model but it looks
		//like this is passed in as a reference and Mongojs handles that automatically.
		Model._db.collection(this._meta.name).save(this, callback);
	};
	
	//Static methods
	model.validate = function (callback) {
		model.prototype._meta.validate = callback;
	};

	return model;
};