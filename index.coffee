Query =
  query:false
  options:{}
  conditions:{}

  # init
  init:(@query)->
    @order()
    @limit()
    @opt()
    @

  #Clean regexp simbols
  escapeRegExp: (str)->
    str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")

  # Parse ~, !
  # @param str[String]  '!name'
  # @return Object condition value
  parse:(str)->
    tr = @_str str
    # not eq
    return $ne: tr if str[0] is '!'
    # ~regex
    return $regex:@escapeRegExp( tr), $options:'i' if str[0] is '~'
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
  Query.init query
