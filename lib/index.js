import 'babel-polyfill';
import SimpleSchema from 'simpl-schema';
import faker from 'faker';
import Random from 'meteor-random';
import regeneratorRuntime from 'babel-runtime/regenerator';

const utils = {};
const Fake = {};

const _MAX_INT = 9007199254740991;
const _MIN_INT = -9007199254740991;

const defaultParams = {
  minArrayLength: 2,
  maxArrayLength: 10,
  callbacks: {},
};

/**
*
* returns a random string;
*
* @params {number} min
* @params {number} max
*
**/
utils.getRandomString = function (min = 0, max = 100) {
  const length = Math.round(Math.random() * (max - min)) + min;
  let value = faker.lorem.word();
  let word = '';
  while (value.length + word.length < min + length) {
    value += (word.length > 0) ? (' ' + word) : word;
    word = faker.lorem.word();
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
  let { allowedValues, min = _MIN_INT, max = _MAX_INT, regEx, fake, type } = schemaKey.type.definitions[0];
  let value = null;

  switch (type) {
    case String:
      switch (String(regEx)) {
        case String(SimpleSchema.RegEx.Id):
          value = Random.id();
          break;
        default:
          if (allowedValues) {
            value = faker.random.arrayElement(allowedValues);
          } else {
            min = (min > 0) ? min : 0;
            max = (max < 100) ? max : 100;
            value = utils.getRandomString(min, max);
          }
          break;
      }

      break;
    case SimpleSchema.Integer:
      value = faker.random.number({ min, max });
      break;
    case 'Number':
      value = faker.random.number({ min, max });
      break;
    case Boolean:
      value = faker.random.boolean();
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
const generateInnerObjectField = (schemaKey, deepness, obj, params, fakeFn) => {
  if (!deepness || !Array.isArray(deepness) || deepness.length === 0) return;
  const d = deepness[0];


  if (deepness.length === 1) {
    obj[d] = utils.generateValue(schemaKey);
  } else if (deepness[1] === '$') {
    if (!obj[d]) obj[d] = [];
    const arr = obj[d];
    const create = (arr.length === 0);
    const len = create ? faker.random.number({ min: params.minArrayLength, max: params.maxArrayLength }) : arr.length;

    for (let j = 0; j < len; j++) {
      if (deepness[2]) {
        if (create) arr.push({});
        generateInnerObjectField(schemaKey, _.drop(deepness, 2), arr[j], params);
      } else {
        if (create) arr.push(utils.generateValue(schemaKey, fakeFn));
      }
    }
  } else if (d === '') {
    if (!obj[d]) obj[d] = {};
  } else {
    if (!obj[d]) obj[d] = {};
    generateInnerObjectField(schemaKey, _.drop(deepness, 1), obj[d], params);
  }
};

/** Return one instance accordingly to schema **/
function simpleSchemaDoc(schema, overrideDoc = {}, params = {}, fakers = {}) {
  const fakeObj = {};
  params = Object.assign({}, params, defaultParams);

  schema._schemaKeys.forEach((key) => {
    const schemaKey = schema._schema[key];
    const deepness = key.split('.'); // calculate if that field is description of inner object
    if (deepness.length > 1) {
      generateInnerObjectField(schemaKey, deepness, fakeObj, params, fakers);
    } else { // if it is just field in schema, not object or [Object]
      fakeObj[key] = utils.generateValue(schemaKey, fakers[key]);
    }
  });
  return Object.assign({}, fakeObj, overrideDoc);
}

function factory(schema, overrideDoc = {}, params = {}, fakers = {}) {
  return {
    create(overrideDocLocal = {}) {
      return simpleSchemaDoc(schema, Object.assign({}, overrideDoc, overrideDocLocal), params, fakers);
    },
  };
}

/** Generator for simpleSchemaDoc **/
function* simpleSchemaDocGenerator(schema, overrideDoc = {}, params = {}, fakers = {}) {
  const orginalSchema = schema;
  const originalOverrideDoc = overrideDoc;
  const originalParams = params;
  const originalFakers = fakers;

  while (true) {
    const result = yield simpleSchemaDoc(schema, overrideDoc, params, fakers);
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
  }
}

Fake.simpleSchemaDoc = simpleSchemaDoc;
Fake.simpleSchemaDocGenerator = simpleSchemaDocGenerator;
Fake.factory = factory;

export default Fake;
