# Plato's Model
**A schema-less, multi-tenancy ODM for MongoDB.**

[![Build Status](https://travis-ci.org/clear/platos-model.png)](https://travis-ci.org/clear/platos-model)
[![NPM version](https://badge.fury.io/js/platos-model.png)](http://badge.fury.io/js/platos-model)

## Installation

	$ npm install platos-model
	
## Usage

### Creating a Model

A **Model** is representative of a set of similar **collections** (one per tenant). Creating them is easy:

	var Platos = require("platos-model");
	Platos.connect("database-name");
	
	var Model = Platos.create("Model");
	
There's no need to define a schema, we're using document storage so you shouldn't box yourself in. Instead, your Model provides a convenient location for housing common methods and operations relevant to your domain logic. Here's an example:

	var Customer = Platos.create("Customer");
	
	//All customers receive a default balance of $20
	Customer.prototype.balance = 20;
	
	Customer.prototype.spend = function (amount) {
		this.balance -= amount;
	};
	
This Model can then be accessed anywhere from within your package just by referencing platos-model:
	
	var Customer = require("platos-model").Customer;

### Instantiating your Model

Following along from the example above, you'll want to create an instance of your Model:

	var bob = new Customer({ name: "Bob", email: "bob@example.com" });
	bob.spend(5);
	//Bob now has a balance of $15
	
And of course, this is easily saved to MongoDB:

	bob.save(function (err, customer) {
		//'err' will contain any errors
		//'customer' will contain the newly saved document => { "name": "Bob", "balance": 15 }
	});
	
Once saved, you can retrieve the document again with the static `Model.find()` method:

	Customer.find({ balance: 15 }, function (err, customers) {
		//'customers' will contain an Array of all customers with a balance of 15
	});
	
If you don't have a reference to an existing Model (which is very likely in large-scale applications), you can update it in-place without finding it.

	Customer.update({ name: "Bob" }, { balance: 50 }, callback);

Or alternatively, if you know some of the existing properties, you can create a partial instance and update based on determined keys:

	var bob = new Customer({ name: "Bob", balance: 60 });
	bob.update([ "name" ], function (err, updateCount) {
		//All customers named "Bob" will have their balance set to 60 and all other existing properties will remain the same
	});


### Multi-tenancy

If you're building a web app, you'll probably have multiple clients running on the same codebase. It's easy to store different clients' data into separate collections with multi-tenancy:

	bob.save("tenant", function (err, customer) { });
	
Likewise, you can easily search tenant-specific collections:

	Customer.find("tenant", { name: "Bob" }, function (err, customers) {
		//'customers' will contain an Array of customers named Bob in the 'tenant.Customer' collection.
	});
	
## Contributing

All contributions are welcome! I'm happy to accept pull requests as long as they conform to the following guidelines:

- Keep the API clean, we prefer ease-of-use over extra features
- Don't break the build and add tests where necessary
- Keep the coding style consistent, we follow [JSHint's Coding Style](http://www.jshint.com/hack/)

Otherwise, please [open an issue](https://github.com/clear/platos-model/issues/new) if you have any suggestions or find a bug.

## License

[The MIT License (MIT)](https://github.com/clear/platos-model/blob/master/LICENSE) - Copyright (c) 2013 Clear Learning Systems