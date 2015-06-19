###*
 * Express Query to Mongoose model find
###
'use strict'

extend = (source, obj)->
  for name of obj
    source[name] = obj[name]


ret = (name, val)->
  r = {}
  r[name] = val
  r


Query =
  # reserved words
  words:
    order:(value)-> sort:(
      if value[0] is '-'
        name = value.substr( 1 , value.length)
        ret name, -1
      else
        ret value, 1
      )

    limit:(value)-> ret 'limit', parseInt value
    skip :(value)-> ret 'skip', parseInt value

  # Events
  vents:
    escapeRegExp: (str)->
      str.replace /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"

    '~':(name, value)->
      ret name, {$regex: @escapeRegExp(value), $options  : 'i'}
    '#':(name, value)-> ret name, $nin: value.split '|'
    '@':(name, value)-> ret name, $in: value.split '|'
    '[':(name, value)-> ret name, $lte: value
    '<':(name, value)-> ret name, $lt: value
    ']':(name, value)-> ret name, $gte: value
    '>':(name, value)-> ret name, $gt: value
    '!':(name, value)-> ret name, $ne: value
    '+':(name, value)-> ret name, $exists: true
    '-':(name, value)-> ret name, $exists: false
    default:(name, value)->ret name, value


  vent: (vent, name, value)->
    @vents[vent](name, value) if @vents[vent]

  on:(name, fn)->
    @vents[name] = fn
    @

  off:(name)->
    vents[name] = undefined
    @

  logic:(name, value)->
    arr = value.split( ',' )
    query = []
    for value in arr
      d = value.split '='
      query.push @parse ret([d[0]],  d[1])

    ret '$' + name, query

  main:(@query)->
    conditions = {}
    options = {}
    if @query
      # logic
      for name in ['or','and']
        extend conditions, @logic( name, @query[name]) if @query[name]
        delete @query[name]

      # words
      for name of @query
        if @words[name]
          # console.log   @words[name] @query[name]
          extend options, @words[name](@query[name])
          delete @query[name]

      extend conditions, @parse( @query )

    {
      conditions: conditions
      options:  options
    }


  parse:(@query)->
    condition = {}
    if @query
      for name of @query
        value = decodeURI @query[name]
        vent = value[0]
        if @vents[vent]
          extend condition, @vent(vent, name, value.substr( 1 , value.length))
        else
          extend condition, @vent('default' , name, value)
    condition

module.exports = (query)->
  Query.main query


