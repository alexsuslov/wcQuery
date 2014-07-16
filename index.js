// Generated by CoffeeScript 1.7.1
var Query;

Query = {
  query: false,
  options: {},
  conditions: {},
  init: function(query) {
    this.query = query;
    this.order();
    this.limit();
    this.opt();
    return this;
  },
  escapeRegExp: function(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  },
  parse: function(str) {
    var tr;
    tr = this._str(str);
    if (str[0] === '!') {
      return {
        $ne: tr
      };
    }
    if (str[0] === '~') {
      return {
        $regex: this.escapeRegExp(tr),
        $options: 'i'
      };
    }
    return str;
  },

  /*
  Cut first char from string
  @param str[String]  '!test'
  @return String 'test'
   */
  _str: function(str) {
    return str.substr(1, str.length);
  },

  /*
  Create options from query
   */
  opt: function() {
    var name;
    if (this.query) {
      for (name in this.query) {
        this.query[name] = decodeURI(this.query[name]);
        if (this.query[name]) {
          this.conditions[name] = this.parse(this.query[name]);
        }
      }
    }
    return this;
  },

  /*
  Create sort from query
   */
  order: function() {
    var _base;
    if (this.query.order) {
      if ((_base = this.options).sort == null) {
        _base.sort = {};
      }
      if (this.query.order[0] === '-') {
        this.options.sort[this._str(this.query.order)] = -1;
      } else {
        this.options.sort[this.query.order] = 1;
      }
      delete this.query.order;
    }
    return this;
  },

  /*
  Create limit from query
   */
  limit: function() {
    if (this.query.limit) {
      this.options.limit = parseInt(this.query.limit);
      delete this.query.limit;
    } else {
      this.options.limit = 25;
    }
    if (this.query.skip) {
      this.options.skip = parseInt(this.query.skip);
      delete this.query.skip;
    } else {
      this.options.skip = 0;
    }
    return this;
  }
};

module.exports = function(query) {
  return Query.init(query);
};
