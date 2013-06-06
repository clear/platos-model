var cursor = require("./cursor");
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
	Platos._options.separator = Platos._options.separator || ".";
};

//Creates a class with obfuscated metadata and instance methods
Platos.create = function (name, collection) {
	var Model = function (properties) {
		//Use a separate function to trigger hooks
		this.init(properties);
	};
	
	//INSTANCE
	//Default options are inherited from Platos
	Model.prototype._meta = {
		name: name,
		collection: collection || name
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
		Function: save([tenant], [object], callback(err, object))
		Saves the current state of the model to the database.
	*/
	Model.prototype.save = function () {
		var reduced = reduceArguments.apply(this, arguments);
		
		//Insert object if not specified
		if (reduced.args.length === 0 || _.isFunction(reduced.args[0])) {
			reduced.args.splice(0, 0, this);
		} else {
			//If the object is specified, then we'll need to wrap the callback to pull _id
			//out of the returned object. This isn't necessary if it isn't specified since it
			//will be automatically inserted into the 'this' reference.
			if (_.isFunction(_.last(reduced.args))) {
				reduced.args[reduced.args.length - 1] = _.wrap(_.last(reduced.args), function (callback, err, object) {
					if (!_.isUndefined(object))
						this._id = object._id;

					callback(err, object);
				}.bind(this));
			}
		}
		
		reduced.collection.save.apply(reduced.collection, reduced.args);
	};
	
	/*
		Function: update([tenant], keys, [options], callback(err, object))
		Syntactic sugar for updating a model in the database that hasn't
		been found yet. Will use **keys** to search for the instance before
		updating all other properties.
	*/
	Model.prototype.update = function () {
		//Construct query
		var args = Array.prototype.slice.call(arguments, 0);
		var query = { };
		var properties = this;
		var iKeys = (_.isString(arguments[0]) ? 1 : 0);
		
		//Separate search keys from update properties
		_.each(args[iKeys], function (element) {
			//Only update query if not already an object
			if (_.isArray(args[iKeys])) {
				query[element] = this[element];
			}
		}.bind(this));
		
		//Never update _id
		delete properties._id;
		
		//Update array argument if the query wasn't explicitly specified
		if (_.isArray(args[iKeys]))
			args[iKeys] = query;
		
		//Ensure properties will be set
		if (!_.isObject(arguments[iKeys + 1]) || _.isFunction(arguments[iKeys + 1]))
			args[iKeys + 1] = { $set: properties };
		
		//And options
		if (!_.isObject(arguments[iKeys + 2]) || _.isFunction(arguments[iKeys + 2]))
			args[iKeys + 2] = { upsert: false };
			
		args[iKeys + 3] = _.last(arguments);
		
		Model.update.apply(Model, args);
	};
		
	/*
		Function: remove([tenant], callback(err, object))
		Removes this instance of Model from the database.
	*/
	Model.prototype.remove = function () {
		//Simply re-route to static method
		if (arguments.length === 2)
			Model.remove(arguments[0], { _id: this._id }, arguments[1]);
		else if (arguments.length === 1)
			Model.remove({ _id: this._id }, arguments[0]);
	};
	
	
	//STATIC
	Model._meta = {
		name: name,
		collection: collection || name
	};
	
	//Add hooks
	for (var key in hooks)
		Model[key] = hooks[key];
	
	/*
		Function: inherit
		Will inherit non-existing prototypal functions from parent.
	*/
	Model.inherits = function (parent) {
		Object.keys(parent.prototype).forEach(function (key) {
			if (this.prototype[key] === undefined)
				this.prototype[key] = parent.prototype[key];
		}.bind(this));
	};
	
	Model.create = function (callback) {
		callback();
	};

	/*
		Function: find([tenant], [query], callback(err, object))
		Retrieves all instances of Model matching **query**, if query is not defined then
		retrieves all instances of Model that exist.
	*/
	Model.find = function () {
		var reduced = reduceArguments.apply(this, arguments);
		
		//Wrap callback so we can intercept the returned objects and convert them to this Model
		reduced.args[reduced.args.length - 1] = _.wrap(_.last(reduced.args), function (callback, err, objects) {
			if (!_.isUndefined(objects)) {
				objects = objects.map(function (object) {
					return new Model(object);
				});
			}
						
			callback(err, objects);
		});
		
		return cursor(reduced.collection.find.apply(reduced.collection, reduced.args), Model);
	};
	
	/*
		Function: update([tenant], query, properties, callback(err, object))
		Will update the **parameters** of all Models matching **query**.
	*/
	Model.update = function () {
		var reduced = reduceArguments.apply(this, arguments);
		reduced.collection.update.apply(reduced.collection, reduced.args);
	};
	
	/*
		Function: remove([tenant], [query], callback(err, object))
		Removes all instances of Model matching **query**, if query is not defined then
		completely removes all instances of Model.
	*/
	Model.remove = function () {
		var reduced = reduceArguments.apply(this, arguments);
		reduced.collection.remove.apply(reduced.collection, reduced.args);
	};

	
	//Expose global
	Platos[name] = Model;

	return Model;
};

/*
	Function: reduceArguments()
	Global helper function for converting any of the above method calls into their apporiate
	form with/without a tenant-specific collection.
*/
function reduceArguments() {
	var collection;
	var args = _.toArray(arguments);
	
	//For tenants, find specific collection and remove the first argument
	if (arguments.length > 0 && _.isString(arguments[0])) {
		collection = Platos._db.collection(arguments[0] + Platos._options.separator + this._meta.collection);
		args = _.rest(arguments);
	} else {
		collection = Platos._db.collection(this._meta.collection);
	}
	
	return { collection: collection, args: args };
}