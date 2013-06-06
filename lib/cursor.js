var _ = require("underscore");

//Export a mock cursor object that will redirect calls and convert the result into a Model.
module.exports = function (cursor, Model) {
	var mockCursor = { };
		
	//Iterate through all cursor functions - we use underscore for this to create a closure
	//since using a loop will lose the value of 'key'.
	_.each(_.keys(Object.getPrototypeOf(cursor)), function (key) {
		mockCursor[key] = function () {
			var args = _.toArray(arguments);
			
			//Wrap callback
			if (_.isFunction(_.last(args))) {
				args[arguments.length - 1] = _.wrap(_.last(args), function (callback, err, objects) {
					if (!_.isUndefined(objects)) {
						objects = objects.map(function (object) {
							return new Model(object);
						});
					}
					
					callback(err, objects);
				});
			}
			
			cursor[key].apply(cursor, args);
			
			return cursor;
		};
	});
	
	return mockCursor;
};