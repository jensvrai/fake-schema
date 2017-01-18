'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _simplSchema = require('simpl-schema');

var _simplSchema2 = _interopRequireDefault(_simplSchema);

var _faker = require('faker');

var _faker2 = _interopRequireDefault(_faker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var utils = {};
var Fake = {};

var _MAX_INT = 9007199254740991;
var _MIN_INT = -9007199254740991;

var defaultParams = {
  minArrayLength: 2,
  maxArrayLength: 10,
  callbacks: {}
};

utils.getRandomString = function () {
  var min = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;

  var value = _faker2.default.lorem.word();
  var length = Math.round(Math.random() * (max - min)) + min;
  var word = '';
  while (value.length + word.length < min + length) {
    value += word.length > 0 ? ' ' + word : word;
    word = _faker2.default.lorem.word();
  }
  return value;
};

utils.generateValue = function (schemaKey) {
  var _schemaKey$type$defin = schemaKey.type.definitions[0],
      allowedValues = _schemaKey$type$defin.allowedValues,
      _schemaKey$type$defin2 = _schemaKey$type$defin.min,
      min = _schemaKey$type$defin2 === undefined ? _MIN_INT : _schemaKey$type$defin2,
      _schemaKey$type$defin3 = _schemaKey$type$defin.max,
      max = _schemaKey$type$defin3 === undefined ? _MAX_INT : _schemaKey$type$defin3,
      regEx = _schemaKey$type$defin.regEx,
      fake = _schemaKey$type$defin.fake,
      type = _schemaKey$type$defin.type,
      value = null;


  switch (type) {
    case String:
      switch (regEx) {
        case _simplSchema2.default.RegEx.Id:
          value = Random.id();
          break;
        default:
          if (allowedValues) {
            value = _faker2.default.random.arrayElement(allowedValues);
          } else {
            min = min > 0 ? min : 0;
            max = max < 100 ? max : 100;
            value = utils.getRandomString(min, max);
          }
          break;
      }

      break;
    case _simplSchema2.default.Integer:
      value = _faker2.default.random.number();
      break;
    case 'Number':
      value = _faker2.default.random.number();
      break;
    case Boolean:
      value = _faker2.default.random.boolean();
      break;
    case 'Date':
      value = new Date();
      break;
    case 'Object':
      value = {};
      break;
  }

  if (typeof fake === 'function') {
    value = fake(schemaKey, value);
  }

  return value;
};

/** Generate one instance accordingly to schema **/
Fake.simpleSchemaDoc = function (schema) {
  var overrideDoc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var fakeObj = {};
  params = Object.assign({}, params, defaultParams);

  schema._schemaKeys.forEach(function (key) {
    var schemaKey = schema._schema[key];
    var deepness = key.split('.'); // calculate if that field is description of inner object
    if (deepness.length > 1) {
      generateInnerObjectField(schemaKey, deepness, fakeObj, params);
    } else {
      // if it is just field in schema, not object or [Object]
      fakeObj[key] = generateValue(schemaKey);
    }
  });
  return Object.assign({}, overrideDoc, fakeObj);
};

Fake.simpleSchemaCreateDoc = function (collection, overrideDoc, params) {
  var doc = Fake.simpleSchemaDoc(collection._c2._simpleSchema, overrideDoc, params);
  doc._id = collection.insert(doc);
  return doc;
};

/** Generate array if objects using simple-schema **/
Fake.simpleSchemaArray = function (schema) {
  var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var initialDoc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var result = [];
  for (var i = 0; i < length; i++) {
    result.push(Fake.simpleSchemaDoc(schema, initialDoc));
  }
  return result;
};

exports.default = Fake;