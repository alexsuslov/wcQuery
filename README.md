# Resp.query -> Mongoose model find options

## Comparison Query Operators

### EQ
- url: /api/item?name=test
    + name: 'test'

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
- url: /api/item?name=>1
    + name: $lt: 1

### LTE
- url: /api/item?name=]1
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
