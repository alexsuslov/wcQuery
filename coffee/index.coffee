'use strict'
###
Express req.query -> Mongoose model find options
@author Alex Suslov <suslov@me.com>
@copyright MIT
@version 0.0.8
###
Query =
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

    r =
      conditions: @conditions
      options: @options
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
    # in
    return $in: tr.split '|' if str[0] is '@'
    # nin
    return $nin: tr.split '|' if str[0] is '#'
    # gt
    return $gt: tr if str[0] is '>'
    # gte
    return $gte: tr if str[0] is ']'
    # lt
    return $lt: tr if str[0] is '<'
    # lte
    return $lte: tr if str[0] is '['
    # not eq
    return $ne: tr if str[0] is '!'
    # ~regex
    return $regex:@escapeRegExp( tr), $options:'i' if str[0] is '~'
    # # text
    # return $text:$search:tr if str[0] is '$'
    str

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
        @conditions[name] = @parse @query[name] if @query[name]
    @


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


