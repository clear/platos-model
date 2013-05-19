REPORTER = spec

test: test-unit test-integration

test-unit:
	node_modules/mocha/bin/mocha --reporter $(REPORTER) test/unit

test-integration:
	node_modules/mocha/bin/mocha --reporter $(REPORTER) test/integration