'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

require('babel-polyfill');

var _simplSchema = require('simpl-schema');

var _simplSchema2 = _interopRequireDefault(_simplSchema);

var _faker = require('faker');

var _faker2 = _interopRequireDefault(_faker);

var _bson = require('bson');

var _bson2 = _interopRequireDefault(_bson);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = [simpleSchemaDocGenerator].map(regeneratorRuntime.mark);

var ObjectId = _bson2.default.ObjectId;

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
          value = new ObjectId();
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
  // return Object.assign({}, overrideDoc, fakeObj);
  return Object.assign({}, overrideDoc, fakeObj);
}

/** Generator for simpleSchemaDoc **/
function simpleSchemaDocGenerator(schema) {
  var overrideDoc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var fakers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  return regeneratorRuntime.wrap(function simpleSchemaDocGenerator$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!true) {
            _context.next = 5;
            break;
          }

          _context.next = 3;
          return simpleSchemaDoc(schema, overrideDoc, params, fakers);

        case 3:
          _context.next = 0;
          break;

        case 5:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this);
}

Fake.simpleSchemaDoc = simpleSchemaDoc;
Fake.simpleSchemaDocGenerator = simpleSchemaDocGenerator;

var CompanySchema = new _simplSchema2.default({
  name: {
    type: String,
    label: 'Name'
  },
  bankAccount: {
    type: String,
    label: 'Bank Account',
    optional: true
  },
  website: {
    type: String,
    label: 'Website',
    regEx: _simplSchema2.default.RegEx.Url,
    optional: true
  },
  telephoneNumber: {
    type: String,
    label: 'Telephone Number',
    optional: true
  },
  taxNumber: {
    type: String,
    label: 'Tax Number',
    optional: true
  }
});

// const g = simpleSchemaDoc(CompanySchema);

var _simpleSchemaDocGener = simpleSchemaDocGenerator(CompanySchema),
    _simpleSchemaDocGener2 = _slicedToArray(_simpleSchemaDocGener, 2),
    fakeDoc1 = _simpleSchemaDocGener2[0],
    fakeDoc2 = _simpleSchemaDocGener2[1];

var fakeDoc3 = simpleSchemaDoc(CompanySchema);
// console.log(g.next());
// console.log(g.next());
// console.log(g.next());

console.log('fakeDoc1', fakeDoc1);
console.log('fakeDoc2', fakeDoc2);
console.log('fakeDoc3', fakeDoc3);
console.log('new ObjectId();', new ObjectId());
exports.default = Fake;