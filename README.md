# Resp.query -> Mongoose model find options

## Filter
- /api/item?name=test
    + conditions:{name:'test'}
- /api/item?name=!test
    + conditions:{$ne:name:'test'}
- /api/item?name=~test
    + conditions:{name:$regex:'test'}

## Sort

- /api/item?order=name
    + options.sort:{name:1}
- /api/item?order=-name
    + options.sort:{name:-1}

## Limit
- /api/item?limit=25&skip=0
    + options.sort:{skip:0,limit:25}
