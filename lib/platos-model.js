var cursor = require("./cursor");
var mongojs = require("mongojs");
var hooks = require("hooks");
var async = require("async");
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

		//When setting metadata, we want to use the child name (so grab that from the static property)
		//but we want to use the parent collection (unless explicitly specified) so store that and use it if it exists
		var parentMeta = this._meta;
		Model.prototype._meta = Model._meta;

		if (!Model._meta.forceCollection && parentMeta && parentMeta.collection)
			Model.prototype._meta.collection = parentMeta.collection;
	};

	//INSTANCE
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
		}

		//Wrap the callback to tidy up returned details (inserting _id and removing _model)
		if (_.isFunction(_.last(reduced.args))) {
			reduced.args[reduced.args.length - 1] = _.wrap(_.last(reduced.args), function (callback, err, object) {
				//Ensure an object (might simply be success boolean if updating or undefined if failed)
				if (_.isObject(object)) {
					this._id = object._id;
					delete object._model;
				} else {
					delete this._model;
				}

				callback(err, object);
			}.bind(this));
		}
		
		//Add child collection metadata
		reduced.args[0]._model = this._meta.name;

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

		//Add child collection metadata
		args[0]._model = this._meta.name;
		
		Model.update.apply(this, args);
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
	
	/*
		Function: retrieved()
		Called automaticall after data has been retrieved from the database,
		useful for placing sanitisation logic here.
	*/
	Model.prototype.retrieved = function () {
		_.last(arguments)();
	};
	
	
	//STATIC
	Model._meta = {
		name: name,
		collection: collection || name,
		forceCollection: collection !== undefined
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
		var reduced = reduceArguments.apply(this, arguments);
		
		if (_.isFunction(_.last(reduced.args))) {
			//Wrap callback so we can intercept the returned objects and convert them to this Model
			reduced.args[reduced.args.length - 1] = _.wrap(_.last(reduced.args), function (callback, err, objects) {
				if (err || objects.length === 0)
					return callback(err, objects);

				if (!_.isUndefined(objects)) {
					async.map(objects, function (object, modelCallback) {
						//Also automatically call retrieved() on returned instance
						var model = new (Platos[object._model] || Model)(object);
						delete model._model;

						//Create arguments for calling retrieved
						var retArgs = [ function () {
							modelCallback(null, model);
						} ];

						//Tenant is only passed when necessary
						if (reduced.tenant)
							retArgs.splice(0, 0, reduced.tenant);

						model.retrieved.apply(model, retArgs);
					}, callback);
				}
			});
		}
		
		return cursor(reduced.collection.find.apply(reduced.collection, reduced.args), Model, Platos, reduced.tenant);
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
		Function: insert([tenant], array, callback(err, object))
		Will bulk insert the array of documents into the database.
	*/
	Model.insert = function () {
		var reduced = reduceArguments.apply(this, arguments);

		var docs = reduced.args[0];

		if (!_.isArray(docs))
			docs = [ docs ];

		//Call save() to activate hooks
		docs = docs.map(function (document) {
			var args = [ document ];

			if (reduced.tenant)
				args.splice(0, 0, reduced.tenant);

			if (document._meta === undefined)
				document = new Model(document);

			//To activate save hooks, hijack the save method and call it
			var fnSave = Model.prototype.save;

			Model.prototype.save = _.wrap(Model.prototype.save, function () { });

			Model.hook("save", Model.prototype.save);
			Model.prototype.save.apply(document, args);

			//Now return save back to its original state
			Model.prototype.save = fnSave;

			return document;
		});

		reduced.args[0] = docs;
		reduced.collection.insert.apply(reduced.collection, reduced.args);
	};

	/*
		Function: drop([tenant], callback(err, object))
		Will drop the entire collection.
	*/
	Model.drop = function () {
		var reduced = reduceArguments.apply(this, arguments);
		reduced.collection.drop.apply(reduced.collection, reduced.args);
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
	var tenant = null;

	//For tenants, find specific collection and remove the first argument
	if (arguments.length > 0 && _.isString(arguments[0])) {
		tenant = arguments[0];
		collection = Platos._db.collection(tenant + Platos._options.separator + this._meta.collection);
		args = _.rest(arguments);
	} else {
		collection = Platos._db.collection(this._meta.collection);
	}
	
	return { collection: collection, args: args, tenant: tenant };
}