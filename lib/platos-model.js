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
		Function: save([tenant], callback(err, object))
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
		
		collection.save(this, callback);
	};
	
	/*
		Function: update([tenant], keys, callback(err, object))
		Syntactic sugar for updating a model in the database that hasn't
		been found yet. Will use **keys** to search for the instance before
		updating all other properties.
	*/
	Model.prototype.update = function () {
		//Construct query
		var query = { };
		var properties = this;
		var keys = (arguments.length === 2 ? arguments[0] : arguments[1]);
		
		//Separate search keys from update properties
		_.each(keys, function (element, index) {
			//Only update query if not already an object
			if (_.isArray(keys)) {
				query[element] = this[element];
				delete properties[element];
			} else {
				delete properties[index];
			}
		}.bind(this));
		
		//Never update _id
		delete properties._id;
		
		//Query was specified explicityl
		if (!_.isArray(keys))
			query = keys;
		
		if (arguments.length === 3)
			Model.update(arguments[0], query, { $set: properties }, { upsert: true }, arguments[2]);
		else if (arguments.length === 2)
			Model.update(query, { $set: properties }, { upsert: true }, arguments[1]);
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
		name: name
	};
	
	//Add hooks
	for (var key in hooks)
		Model[key] = hooks[key];
	
	Model.create = function (callback) {
		callback();
	};

	/*
		Function: find([tenant], [query], callback(err, object))
		Retrieves all instances of Model matching **query**, if query is not defined then
		retrieves all instances of Model that exist.
	*/
	Model.find = function () {
		var reduced = reduceArguments.apply(Model, arguments);
		
		//Wrap callback so we can intercept the returned objects and convert them to this Model
		reduced.args[reduced.args.length - 1] = _.wrap(_.last(reduced.args), function (callback, err, objects) {
			objects = objects.map(function (object) {
				return new Model(object);
			});
						
			callback(err, objects);
		});
		
		reduced.collection.find.apply(reduced.collection, reduced.args);
	};
	
	/*
		Function: update([tenant], query, properties, callback(err, object))
		Will update the **parameters** of all Models matching **query**.
	*/
	Model.update = function () {
		var reduced = reduceArguments.apply(Model, arguments);
		reduced.collection.update.apply(reduced.collection, reduced.args);
	};
	
	/*
		Function: remove([tenant], [query], callback(err, object))
		Removes all instances of Model matching **query**, if query is not defined then
		completely removes all instances of Model.
	*/
	Model.remove = function () {
		var reduced = reduceArguments.apply(Model, arguments);
		reduced.collection.remove.apply(reduced.collection, reduced.args);
	};

	return Model;
};

/*
	Function: reduceArguments()
	Global helper function for converting any of the above method
	calls into their apporiate form with/without a tenant-specific
	collection.
*/
function reduceArguments() {
	var collection;
	var args = arguments;
	
	//For tenants, find specific collection and remove the first argument
	if (arguments.length > 0 && _.isString(arguments[0])) {
		collection = Platos._db.collection(arguments[0] + Platos._options.separator + this._meta.name);
		args = _.rest(arguments);
	} else {
		collection = Platos._db.collection(this._meta.name);
	}
	
	return { collection: collection, args: args };
}