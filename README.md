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
	
### Instantiating your Model

Following along from the example above, you'll want to create an instance of your Model:

	var bob = new Customer({ name: "Bob" });
	bob.spend(5);
	//Bob now has a balance of $15
	
And of course, this is easily saved to MongoDB:

	bob.save(function (err, customer) {
		//'err' will contain any errors
		//'customer' will contain the newly saved document => { "name": "Bob", "balance": 15 }
	});

### Multi-tenancy

If you're building a web app, you'll probably have multiple clients running on the same codebase. It's easy to store different clients' data into separate collections with multi-tenancy:

	bob.save("tenant", function (err, customer) { });
	
Likewise, you can easily search tenant-specific collections:

	Customer.find("tenant", { name: "Bob" }, function (err, customers) {
		//'customers' will contain a list of customers named Bob in the 'tenant.Customer' collection.
	});