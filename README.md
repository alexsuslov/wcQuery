# Express req.query -> Mongoose model find options
## New in 0.0.10
### ObjectId
- url: /api/item?name=_53c699da9189110000454007
    + name: ObjectId(53c699da9189110000454007)


## Simple use in server api controller:

```
"use strict"

_ = require("lodash")
Item = require("./item.model")
Query = require("wc-query")
fields = {}

# Get list of items
exports.index = (req, res) ->
  query = Query(req.query)
  Item.find query.conditions, fields, query.options, (err, items) ->
    throw err if err
    return handleError(res, err)  if err
    res.json 200, items
```

## Logical Query Operators
### OR 
- /?or='name=3,test=!4'
    + { '$or': [ { name: '3' }, { test: $ne :4 } ] }

### AND 
- /?and='name=3,test=!4'
    + { '$and': [ { name: '3' }, { test: $ne :4 } ] }


## Comparison Query Operators

### EQ
- url: /api/item?name=test
    + name: 'test'

### Exists

- url: /api/item?name=+
    + name: $exists: true

- url: /api/item?name=-
    + name: $exists: false

### ObjectId
- url: /api/item?name=_53c699da9189110000454007
    + name: ObjectId(53c699da9189110000454007)

### NEQ
- url: /api/item?name=!test
    + name: $ne: 'test'

### GT
- url: /api/item?name=>1
    + name: $gt: 1

### GTE
- url: /api/item?name=]1
    + name: $gte: 1

### LT
- url: /api/item?name=<1
    + name: $lt: 1

### LTE
- url: /api/item?name=[1
    + name: $lte: 1

### IN 
- url: /api/item?name=@1|2|3
    + name: $in: ['1','2','3']

### NIN 
- url: /api/item?name=#1|2|3
    + name: $nin: ['1','2','3']

## Evaluation Query Operators
### REGEX 
- url: /api/item?name=~test
    + name: $regex: 'test'


## Sort

- /api/item?order=name
    + options.sort:{name:1}
- /api/item?order=-name
    + options.sort:{name:-1}

## Limit
- /api/item?limit=25&skip=0
    + options.sort:{skip:0,limit:25}
