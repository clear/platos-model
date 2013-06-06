require("should");
var cursor = require("../../lib/cursor");
var sinon = require("sinon");

describe("UNIT - CURSOR", function () {
	it("cursor.sort() - when given a cursor - should call the provided cursor", function () {
		var curs = { sort: function () { } };
		var mock = sinon.mock(curs);
		
		mock.expects("sort").once();
		cursor(curs).sort();
		mock.verify();
	});
});