# platos-model Change Log

## To-Do
- Currently cursors only support sort(), still need to add more functions.

## 0.5.0
- save() can now accept an object to save to the database without changing the instance.
- find() now returns a mock cursor that will allow chaining: model.find().sort().

## 0.4.0
- A few bug fixes.
- Now exposes any created Model via the global platos-model package.
- New built-in prototypal inheritance pattern.

## 0.3.0
- Added update() support via static or instance methods.

## 0.2.0
- Multi-tenancy support added for find(), save() and remove().
- find() now returns instances of Model instead of Objects.

## 0.1.0
- Ability to create and instantiate Models.
- Ability to find(), save() or remove() model instances to MongoDB.
- Ability to add pre() or post() hooks to static methods belonging to Model.