'use strict'
mongoose = require('mongoose')
Schema = mongoose.Schema
ObjectId = Schema.Types.ObjectId
###
Express req.query -> Mongoose model find options
@author Alex Suslov <suslov@me.com>
@copyright MIT
###

Query =
  words:
    limit:(self)->
      self.options.limit = parseInt self.query.limit

    skip:(self)->
      self.options.skip = parseInt self.query.skip

    order:(self)->
      query   = self.query
      options = self.options
      options.sort ?= {}
      if query.order[0] is '-'
        options.sort[self_str(query.order)] = -1
      else
        options.sort[query.order] = 1
      delete query.order
      self

  commands:
    '~':(self)->

  query:false

  ###
  main
  @param query[String] string from EXPRESS req
  @return Object
    conditions: mongo filter object
    options: mongo find options
  ###
  main:(@query)->
    @options = {}
    @conditions = {}

    for name in ['or','and']
      @logical(name)

    @order().limit().opt()

    {
      conditions: @conditions
      options: @options
    }
    # @

  ###
  @param value[String] 'name=test'
  @return Object {name:'test'}
  ###
  expression:(value)->
    data = value.split '='
    ret = {}
    ret[data[0]] = @parse data[1]
    ret

  #create logical function
  # @param name[String] function name ['or','and']
  # @return Object
  logical:(name)->
    if @query[name]
      Arr = @query[name].split ','
      if Arr.length
        @conditions['$' + name] = (for value in Arr
          @expression value)

      delete @query[name]
    @

  parseVal:(val)->
    return parseFloat val   if @type is 'Number'
    return !!val            if @type is 'Boolean'
    return new ObjectId val if @type is 'ObjectID'
    return new Date val     if @type is 'Date'
    val


  ###
  Clean regexp simbols
  @param str[String] string to clean
  @return [String] cleaning string
  ###
  escapeRegExp: (str)->
    str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")

  ###
  Parse ~, !, ....
  @param str[String]  '!name'
  @return Object condition value
  ###
  parse:(str)->
    tr = @_str str
    # mod
    return $mod: tr.split '|' if str[0] is '%'
    # in
    return $in: tr.split '|' if str[0] is '@'
    # nin
    return $nin: tr.split '|' if str[0] is '#'
    # gt
    return $gt: @parseVal tr if str[0] is '>'
    # gte
    return $gte: @parseVal tr if str[0] is ']'
    # lt
    return $lt: @parseVal tr if str[0] is '<'
    # lte
    return $lte: @parseVal tr if str[0] is '['
    # not eq
    return $ne: @parseVal tr if str[0] is '!'
    # Exists
    return "$exists": true if str is '+'
    return "$exists": false if str is '-'
    # ~regex
    return $regex:@escapeRegExp( tr), $options:'i' if str[0] is '~'
    # # text
    # return $text:$search:tr if str[0] is '$'
    # ObjectId
    return new ObjectId(tr) if str[0] is '_'
    @parseVal str



  ###
  Cut first char from string
  @param str[String]  '!test'
  @return String 'test'
  ###
  _str:(str)->
    str.substr( 1 , str.length)

  ###
  Create options from query
  ###
  opt:->
    if @query
      for name of @query
        @query[name] = decodeURI @query[name]
        # detect type
        @type = @detectType name

        @conditions[name] = @parse @query[name] if @query[name]
    @

  detectType: (name)->
    if @model and @model.schema.path(name)
      # Date Boolean Array
      if @model.schema.path(name).instance is 'undefined'
        if model.schema.path(name).options?.type

          if model.schema.path(name).options.type.name is Date
            return 'Date'

          if model.schema.path(name).options.type.name is Boolean
            return 'Boolean'

          if model.schema.path(name).options.type.name is Array
            return 'Array'

      # Number String ObjectID
      return @model.schema.path(name).instance if @model
    'String'


  ###
  Create sort from query
  ###
  order:->
    if @query.order
      @options.sort ?= {}
      if @query.order[0] is '-'
        @options.sort[@_str(@query.order)] = -1
      else
        @options.sort[@query.order] = 1

      delete @query.order
    @


  ###
  Create limit from query
  ###
  limit:->
    # limit
    if @query.limit
      @options.limit = parseInt @query.limit
      delete @query.limit
    else
      @options.limit = 25
    # skip
    if @query.skip
      @options.skip = parseInt @query.skip
      delete @query.skip
    else
      @options.skip = 0
    @


module.exports = (query)->
  Query.main query


module.exports.Query = Query
