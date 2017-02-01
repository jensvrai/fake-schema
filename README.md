Generate Fake data with faker.js and simpl-schema


## Quick Start

### simpleSchemaDoc(schema (, overrideDoc, params, fakers))

```js
import Fake from 'fake-schema';

const CompanySchema = new SimpleSchema({
    name: { 
        type: String,
        label: 'Name'
    },
    bankAccount: {
        type: String,
        label: 'Bank Account',
        optional: true
    }
});

const company = Fake.simpleSchemaDoc(CompanySchema);
```


### simpleSchemaDoc(schema, overrideDoc, params, fakers)

```js
import Fake from 'fake-schema';
import faker from 'faker';

var fakers = {
    name: {}
}

fakers.name = faker.company.companyName;

const CompanySchema = new SimpleSchema({
    name: { 
        type: String,
        label: 'Name'
    },
    bankAccount: {
        type: String,
        label: 'Bank Account',
        optional: true
    }
});

const company = Fake.simpleSchemaDoc(CompanySchema, {}, {}, fakers);
```

### simpleSchemaDocGenerator(schema (, overrideDoc, params, fakers ))

```js
import Fake from 'fake-schema';

const CompanySchema = new SimpleSchema({
    name: { 
        type: String,
        label: 'Name'
    },
    bankAccount: {
        type: String,
        label: 'Bank Account',
        optional: true
    }
});

const companyGenerator = Fake.simpleSchemaDocGenerator(CompanySchema);

companyGenerator.next().value
companyGenerator.next().value
companyGenerator.next().value

```
