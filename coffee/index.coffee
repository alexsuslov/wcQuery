
Query =
  query:false

  # init
  init:(@query)->
    @options = {}
    @conditions = {}
    @order()
    # @or()
    for name in ['or','and']
      @logical(name)
    @limit()
    @opt()
    @

  expression:(value)->
    data = value.split '='
    ret = {}
    ret[data[0]] = @parse data[1]
    ret

  logical:(name)->
    if @query[name]
      Arr = @query[name].split ','
      if Arr.length
        @conditions['$' + name] = (for value in Arr
          @expression value)

      delete @query[name]

  #Clean regexp simbols
  escapeRegExp: (str)->
    str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")

  # Parse ~, !
  # @param str[String]  '!name'
  # @return Object condition value
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
  isString:  (obj)->
    toString.call(obj) == '[object String]'


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
