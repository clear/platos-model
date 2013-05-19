require("should");
var sinon = require("sinon");
var Model = require("../../lib/platos-model");

describe("UNIT - HOOKS", function () {
	it("Class.pre() hook should be called before instance.save()", function (done) {
		var Class = Model.create("Class");
		var stub = sinon.stub();
		
		//Main method, will be called second
		Class.prototype.test = function (callback) {
			stub.callCount.should.equal(1);
			stub();
			callback();
		};
		
		//Pre-hook will be called first
		Class.pre("test", function (next) {
			stub.callCount.should.equal(0);
			stub();
			
			next();
		});
		
		var instance = new Class();
		
		//Now run chain, callback will be called last
		instance.test(function () {
			stub.callCount.should.equal(2);
			
			done();
		});
	});
	
	it("Class.post() hook should be called after instance.save()", function (done) {
		var Class = Model.create("Class");
		var stub = sinon.stub();
		
		//Main method, will be called first
		Class.prototype.test = function (callback) {
			stub.callCount.should.equal(0);
			stub();
			callback();
		};
		
		//Post-hook will be called second
		Class.post("test", function (next) {
			stub.callCount.should.equal(1);
			stub();
			
			next();
		});
		
		var instance = new Class();
		
		//Now run chain, callback will be called last
		instance.test(function () {
			stub.callCount.should.equal(2);
			
			done();
		});
	});
	
	it("Class.pre() and Class.post() hooks should be called in proper sequence", function (done) {
		var Class = Model.create("Class");
		var stub = sinon.stub();
		
		//Main method, will be called second
		Class.prototype.test = function (callback) {
			stub.callCount.should.equal(1);
			stub();
			callback();
		};
		
		//Pre-hook will be called first
		Class.pre("test", function (next) {
			stub.callCount.should.equal(0);
			stub();
			
			next();
		});
		
		//Post-hook will be called third
		Class.post("test", function (next) {
			stub.callCount.should.equal(2);
			stub();
			
			next();
		});
		
		var instance = new Class();
		
		//Now run chain, callback will be called last
		instance.test(function () {
			stub.callCount.should.equal(3);
			
			done();
		});
	});
	
	it("Multiple calls to Class.pre() should be called in the same sequence they're defined", function (done) {
		var Class = Model.create("Class");
		var stub = sinon.stub();
		
		//Main method, will be called second
		Class.prototype.test = function (callback) {
			stub.callCount.should.equal(3);
			stub();
			callback();
		};
		
		Class.pre("test", function (next) {
			stub.callCount.should.equal(0);
			stub();
			
			next();
		});
		
		Class.pre("test", function (next) {
			stub.callCount.should.equal(1);
			stub();
			
			next();
		});
		
		Class.pre("test", function (next) {
			stub.callCount.should.equal(2);
			stub();
			
			next();
		});
		
		var instance = new Class();
		
		instance.test(function () {
			stub.callCount.should.equal(4);
			
			done();
		});
	});
	
	it("Class.pre() can mutate the arguments before reaching the method", function (done) {
		var Class = Model.create("Class");
		
		Class.prototype.test = function (argument) {
			argument.should.equal("second");
			done();
		};
		
		Class.pre("test", function (next, argument) {
			argument.should.equal("first");
			next("second");
		});
		
		var instance = new Class();
		
		instance.test("first");
	});
	
	//Warning: This particular test will fail using the npm version of hooks.js - there"s
	//a bug passing arguments back to the original callback which hasn"t been merged in, so
	//we"re using this repo instead - git://github.com/JamesHight/hooks-js.git
	it("Class.pre() with callback can mutate the arguments before reaching the method", function (done) {
		var Class = Model.create("Class");
		
		Class.prototype.test = function (argument, callback) {
			argument.should.equal("turned my");
			callback("dad on");
		};
		
		Class.pre("test", function (next, argument, callback) {
			argument.should.equal("she");
			next("turned my", callback);
		});
		
		var instance = new Class();
		
		instance.test("she", function (argument) {
			argument.should.equal("dad on");
			done();
		});
	});
});