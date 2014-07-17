var Query;

Query = {
  query: false,
  init: function(query) {
    this.query = query;
    this.options = {};
    this.conditions = {};
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
    if (str[0] === '@') {
      return {
        $in: tr.split('|')
      };
    }
    if (str[0] === '#') {
      return {
        $nin: tr.split('|')
      };
    }
    if (str[0] === '>') {
      return {
        $gt: tr
      };
    }
    if (str[0] === ']') {
      return {
        $gte: tr
      };
    }
    if (str[0] === '<') {
      return {
        $lt: tr
      };
    }
    if (str[0] === '[') {
      return {
        $lte: tr
      };
    }
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
    if (str[0] === '$') {
      return {
        $text: {
          $search: tr
        }
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
