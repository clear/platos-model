var async = require("async");
var _ = require("underscore");

//Export a mock cursor object that will redirect calls and convert the result into a Model.
module.exports = function (cursor, Model, Platos, tenant) {
	var mockCursor = { };
		
	//Iterate through all cursor functions - we use underscore for this to create a closure
	//since using a loop will lose the value of 'key'.
	_.each(_.keys(Object.getPrototypeOf(cursor)), function (key) {
		mockCursor[key] = function () {
			var args = _.toArray(arguments);
			
			//Wrap callback
			if (_.isFunction(_.last(args))) {
				args[arguments.length - 1] = _.wrap(_.last(args), function (callback, err, objects) {
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
							if (tenant)
								retArgs.splice(0, 0, tenant);

							model.retrieved.apply(model, retArgs);
						}, callback);
					}
				});
			}
			
			cursor[key].apply(cursor, args);
			
			return mockCursor;
		};
	});
	
	return mockCursor;
};