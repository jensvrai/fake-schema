import SimpleSchema from 'simpl-schema';
import faker from 'faker';

let utils = {};
let Fake = {};

const _MAX_INT = 9007199254740991;
const _MIN_INT = -9007199254740991;

const defaultParams = {
  minArrayLength: 2,
  maxArrayLength: 10,
  callbacks: {}
};

utils.getRandomString = function (min = 0, max = 100) {
	var value = faker.lorem.word();
	var length = Math.round(Math.random() * (max - min)) + min;
	var word = '';
	while(value.length + word.length < min + length) {
		value += (word.length > 0) ? ' ' + word : word;
		word = faker.lorem.word();
	}
	return value;
};

utils.generateValue = function(schemaKey) {
  let {allowedValues, min=_MIN_INT, max=_MAX_INT, regEx, fake, type} = schemaKey.type.definitions[0],
  		value = null;

  switch (type) {
    case String:
      switch (regEx) {
        case SimpleSchema.RegEx.Id:
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
      value = faker.random.number();
      break;
    case 'Number':
      value = faker.random.number();
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
  }

  if (typeof fake === 'function') {
    value = fake(schemaKey, value);
  }

  return value;

};

/** Generate one instance accordingly to schema **/
Fake.simpleSchemaDoc = function(schema, overrideDoc={}, params={}) {
  var fakeObj = {};
  params = Object.assign({},params,defaultParams);

  schema._schemaKeys.forEach(function (key) {
    const schemaKey = schema._schema[key];
    let deepness = key.split('.'); // calculate if that field is description of inner object
    if (deepness.length > 1) {
      generateInnerObjectField(schemaKey, deepness, fakeObj, params);
    } else { // if it is just field in schema, not object or [Object]
      fakeObj[key] = generateValue(schemaKey);
    }
  });
  return Object.assign({}, overrideDoc, fakeObj);
};

Fake.simpleSchemaCreateDoc = (collection, overrideDoc, params) => {
  const doc = Fake.simpleSchemaDoc(collection._c2._simpleSchema, overrideDoc, params);
  doc._id = collection.insert(doc);
  return doc;
};

/** Generate array if objects using simple-schema **/
Fake.simpleSchemaArray = function(schema, length = 1, initialDoc = {}) {
  let result = [];
  for (var i = 0; i < length; i++) {
    result.push(Fake.simpleSchemaDoc(schema,initialDoc))
  }
  return result;
};

export default Fake;