'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

require('babel-polyfill');

var _simplSchema = require('simpl-schema');

var _simplSchema2 = _interopRequireDefault(_simplSchema);

var _faker = require('faker');

var _faker2 = _interopRequireDefault(_faker);

var _meteorRandom = require('meteor-random');

var _meteorRandom2 = _interopRequireDefault(_meteorRandom);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = [simpleSchemaDocGenerator].map(_regenerator2.default.mark);

var utils = {};
var Fake = {};

var _MAX_INT = 9007199254740991;
var _MIN_INT = -9007199254740991;

var defaultParams = {
  minArrayLength: 2,
  maxArrayLength: 10,
  callbacks: {}
};

/**
*
* returns a random string;
*
* @params {number} min
* @params {number} max
*
**/
utils.getRandomString = function () {
  var min = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;

  var length = Math.round(Math.random() * (max - min)) + min;
  var value = _faker2.default.lorem.word();
  var word = '';
  while (value.length + word.length < min + length) {
    value += word.length > 0 ? ' ' + word : word;
    word = _faker2.default.lorem.word();
  }
  return value;
};

/**
*
* returns the generated value;
*
* @params {object} schemaKey
* @params {function} fakeFn
*
**/
utils.generateValue = function (schemaKey, fakeFn) {
  var _schemaKey$type$defin = schemaKey.type.definitions[0],
      allowedValues = _schemaKey$type$defin.allowedValues,
      _schemaKey$type$defin2 = _schemaKey$type$defin.min,
      min = _schemaKey$type$defin2 === undefined ? _MIN_INT : _schemaKey$type$defin2,
      _schemaKey$type$defin3 = _schemaKey$type$defin.max,
      max = _schemaKey$type$defin3 === undefined ? _MAX_INT : _schemaKey$type$defin3,
      regEx = _schemaKey$type$defin.regEx,
      fake = _schemaKey$type$defin.fake,
      type = _schemaKey$type$defin.type;

  var value = null;

  switch (type) {
    case String:
      switch (regEx) {
        case _simplSchema2.default.RegEx.Id:
          value = _meteorRandom2.default.id();
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
      value = _faker2.default.random.number({ min: min, max: max });
      break;
    case 'Number':
      value = _faker2.default.random.number({ min: min, max: max });
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
    default:
      break;
  }

  if (typeof fakeFn === 'function') {
    value = fakeFn();
  }

  return value;
};

/** Recursive create fields for inner objects and arrays **/
var generateInnerObjectField = function generateInnerObjectField(schemaKey, deepness, obj, params) {
  if (!deepness || !Array.isArray(deepness) || deepness.length === 0) return;
  var d = deepness[0];

  if (deepness.length === 1) {
    obj[d] = utils.generateValue(schemaKey);
  } else if (deepness[1] === '$') {
    if (!obj[d]) obj[d] = [];
    var arr = obj[d];
    var create = arr.length === 0;
    var len = create ? _faker2.default.random.number({ min: params.minArrayLength, max: params.maxArrayLength }) : arr.length;

    for (var j = 0; j < len; j++) {
      if (create) arr.push({});
      generateInnerObjectField(schemaKey, _.drop(deepness, 2), arr[j], params);
    }
  } else if (d === '') {
    if (!obj[d]) obj[d] = {};
  } else {
    if (!obj[d]) obj[d] = {};
    generateInnerObjectField(schemaKey, _.drop(deepness, 1), obj[d], params);
  }
};

/** Return one instance accordingly to schema **/
function simpleSchemaDoc(schema) {
  var overrideDoc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var fakers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var fakeObj = {};
  params = Object.assign({}, params, defaultParams);

  schema._schemaKeys.forEach(function (key) {
    var schemaKey = schema._schema[key];
    var deepness = key.split('.'); // calculate if that field is description of inner object
    if (deepness.length > 1) {
      generateInnerObjectField(schemaKey, deepness, fakeObj, params);
    } else {
      // if it is just field in schema, not object or [Object]
      fakeObj[key] = utils.generateValue(schemaKey, fakers[key]);
    }
  });
  return Object.assign({}, fakeObj, overrideDoc);
}

function factory(schema) {
  var overrideDoc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var fakers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  return {
    create: function create() {
      var overrideDocLocal = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      return simpleSchemaDoc(schema, Object.assign({}, overrideDoc, overrideDocLocal), params, fakers);
    }
  };
}

/** Generator for simpleSchemaDoc **/
function simpleSchemaDocGenerator(schema) {
  var overrideDoc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var fakers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var orginalSchema, originalOverrideDoc, originalParams, originalFakers, result;
  return _regenerator2.default.wrap(function simpleSchemaDocGenerator$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          orginalSchema = schema;
          originalOverrideDoc = overrideDoc;
          originalParams = params;
          originalFakers = fakers;

        case 4:
          if (!true) {
            _context.next = 11;
            break;
          }

          _context.next = 7;
          return simpleSchemaDoc(schema, overrideDoc, params, fakers);

        case 7:
          result = _context.sent;

          if (result) {
            if (result.schema) {
              schema = result.orginalSchema;
            } else {
              schema = orginalSchema;
            }

            if (result.overrideDoc) {
              overrideDoc = result.overrideDoc;
            } else {
              overrideDoc = originalOverrideDoc;
            }

            if (result.params) {
              params = result.params;
            } else {
              params = originalParams;
            }

            if (result.fakers) {
              fakers = result.fakers;
            } else {
              fakers = originalFakers;
            }
          } else {
            schema = orginalSchema;
            overrideDoc = originalOverrideDoc;
            params = originalParams;
            fakers = originalFakers;
          }
          _context.next = 4;
          break;

        case 11:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this);
}

Fake.simpleSchemaDoc = simpleSchemaDoc;
Fake.simpleSchemaDocGenerator = simpleSchemaDocGenerator;
Fake.factory = factory;

exports.default = Fake;