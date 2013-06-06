var _ = require("underscore");

//Export a mock cursor object that will redirect calls and convert the result into a Model.
module.exports = function (cursor, Model) {
	var mockCursor = { };
	
	//Go through all supported cursor methods
	_.each(["sort"], function (key) {
		mockCursor[key] = function () {
			var args = _.toArray(arguments);
			
			//Wrap callback
			args[arguments.length - 1] = _.wrap(_.last(args), function (callback, err, objects) {
				if (!_.isUndefined(objects)) {
					objects = objects.map(function (object) {
						return new Model(object);
					});
				}

				callback(err, objects);
			});

			cursor.sort.apply(cursor, args);
			
			return cursor;
		};
	});
	
	return mockCursor;
};