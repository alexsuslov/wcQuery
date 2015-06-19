
/**
 * Express Query to Mongoose model find
 */
'use strict';
var Query, extend, ret;

extend = function(source, obj) {
  var name, _results;
  _results = [];
  for (name in obj) {
    _results.push(source[name] = obj[name]);
  }
  return _results;
};

ret = function(name, val) {
  var r;
  r = {};
  r[name] = val;
  return r;
};

Query = {
  words: {
    order: function(value) {
      var name;
      return {
        sort: (value[0] === '-' ? (name = value.substr(1, value.length), ret(name, -1)) : ret(value, 1))
      };
    },
    limit: function(value) {
      return ret('limit', parseInt(value));
    },
    skip: function(value) {
      return ret('skip', parseInt(value));
    }
  },
  vents: {
    escapeRegExp: function(str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    },
    '~': function(name, value) {
      return ret(name, {
        $regex: this.escapeRegExp(value),
        $options: 'i'
      });
    },
    '#': function(name, value) {
      return ret(name, {
        $nin: value.split('|')
      });
    },
    '@': function(name, value) {
      return ret(name, {
        $in: value.split('|')
      });
    },
    '[': function(name, value) {
      return ret(name, {
        $lte: value
      });
    },
    '<': function(name, value) {
      return ret(name, {
        $lt: value
      });
    },
    ']': function(name, value) {
      return ret(name, {
        $gte: value
      });
    },
    '>': function(name, value) {
      return ret(name, {
        $gt: value
      });
    },
    '!': function(name, value) {
      return ret(name, {
        $ne: value
      });
    },
    '+': function(name, value) {
      return ret(name, {
        $exists: true
      });
    },
    '-': function(name, value) {
      return ret(name, {
        $exists: false
      });
    },
    "default": function(name, value) {
      return ret(name, value);
    }
  },
  vent: function(vent, name, value) {
    if (this.vents[vent]) {
      return this.vents[vent](name, value);
    }
  },
  on: function(name, fn) {
    this.vents[name] = fn;
    return this;
  },
  off: function(name) {
    vents[name] = void 0;
    return this;
  },
  logic: function(name, value) {
    var arr, d, query, _i, _len;
    arr = value.split(',');
    query = [];
    for (_i = 0, _len = arr.length; _i < _len; _i++) {
      value = arr[_i];
      d = value.split('=');
      query.push(this.parse(ret([d[0]], d[1])));
    }
    return ret('$' + name, query);
  },
  main: function(query) {
    var conditions, name, options, _i, _len, _ref;
    this.query = query;
    conditions = {};
    options = {};
    if (this.query) {
      _ref = ['or', 'and'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        if (this.query[name]) {
          extend(conditions, this.logic(name, this.query[name]));
        }
        delete this.query[name];
      }
      for (name in this.query) {
        if (this.words[name]) {
          extend(options, this.words[name](this.query[name]));
          delete this.query[name];
        }
      }
      extend(conditions, this.parse(this.query));
    }
    return {
      conditions: conditions,
      options: options
    };
  },
  parse: function(query) {
    var condition, name, value, vent;
    this.query = query;
    condition = {};
    if (this.query) {
      for (name in this.query) {
        value = decodeURI(this.query[name]);
        vent = value[0];
        if (this.vents[vent]) {
          extend(condition, this.vent(vent, name, value.substr(1, value.length)));
        } else {
          extend(condition, this.vent('default', name, value));
        }
      }
    }
    return condition;
  }
};

module.exports = function(query) {
  return Query.main(query);
};

'use strict';
var ObjectId, Query, Schema, mongoose;

mongoose = require('mongoose');

Schema = mongoose.Schema;

ObjectId = Schema.Types.ObjectId;


/*
Express req.query -> Mongoose model find options
@author Alex Suslov <suslov@me.com>
@copyright MIT
 */

Query = {
  words: {
    limit: function(self) {
      return self.options.limit = parseInt(self.query.limit);
    },
    skip: function(self) {
      return self.options.skip = parseInt(self.query.skip);
    },
    order: function(self) {
      var options, query;
      query = self.query;
      options = self.options;
      if (options.sort == null) {
        options.sort = {};
      }
      if (query.order[0] === '-') {
        options.sort[self_str(query.order)] = -1;
      } else {
        options.sort[query.order] = 1;
      }
      delete query.order;
      return self;
    }
  },
  commands: {
    '~': function(self) {}
  },
  query: false,

  /*
  main
  @param query[String] string from EXPRESS req
  @return Object
    conditions: mongo filter object
    options: mongo find options
   */
  main: function(query) {
    var name, _i, _len, _ref;
    this.query = query;
    this.options = {};
    this.conditions = {};
    _ref = ['or', 'and'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      name = _ref[_i];
      this.logical(name);
    }
    this.order().limit().opt();
    return {
      conditions: this.conditions,
      options: this.options
    };
  },

  /*
  @param value[String] 'name=test'
  @return Object {name:'test'}
   */
  expression: function(value) {
    var data, ret;
    data = value.split('=');
    ret = {};
    ret[data[0]] = this.parse(data[1]);
    return ret;
  },
  logical: function(name) {
    var Arr, value;
    if (this.query[name]) {
      Arr = this.query[name].split(',');
      if (Arr.length) {
        this.conditions['$' + name] = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = Arr.length; _i < _len; _i++) {
            value = Arr[_i];
            _results.push(this.expression(value));
          }
          return _results;
        }).call(this);
      }
      delete this.query[name];
    }
    return this;
  },
  parseVal: function(val) {
    if (this.type === 'Number') {
      return parseFloat(val);
    }
    if (this.type === 'Boolean') {
      return !!val;
    }
    if (this.type === 'ObjectID') {
      return new ObjectId(val);
    }
    if (this.type === 'Date') {
      return new Date(val);
    }
    return val;
  },

  /*
  Clean regexp simbols
  @param str[String] string to clean
  @return [String] cleaning string
   */
  escapeRegExp: function(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  },

  /*
  Parse ~, !, ....
  @param str[String]  '!name'
  @return Object condition value
   */
  parse: function(str) {
    var tr;
    tr = this._str(str);
    if (str[0] === '%') {
      return {
        $mod: tr.split('|')
      };
    }
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
        $gt: this.parseVal(tr)
      };
    }
    if (str[0] === ']') {
      return {
        $gte: this.parseVal(tr)
      };
    }
    if (str[0] === '<') {
      return {
        $lt: this.parseVal(tr)
      };
    }
    if (str[0] === '[') {
      return {
        $lte: this.parseVal(tr)
      };
    }
    if (str[0] === '!') {
      return {
        $ne: this.parseVal(tr)
      };
    }
    if (str === '+') {
      return {
        "$exists": true
      };
    }
    if (str === '-') {
      return {
        "$exists": false
      };
    }
    if (str[0] === '~') {
      return {
        $regex: this.escapeRegExp(tr),
        $options: 'i'
      };
    }
    if (str[0] === '_') {
      return new ObjectId(tr);
    }
    return this.parseVal(str);
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
        this.type = this.detectType(name);
        if (this.query[name]) {
          this.conditions[name] = this.parse(this.query[name]);
        }
      }
    }
    return this;
  },
  detectType: function(name) {
    var _ref;
    if (this.model && this.model.schema.path(name)) {
      if (this.model.schema.path(name).instance === 'undefined') {
        if ((_ref = model.schema.path(name).options) != null ? _ref.type : void 0) {
          if (model.schema.path(name).options.type.name === Date) {
            return 'Date';
          }
          if (model.schema.path(name).options.type.name === Boolean) {
            return 'Boolean';
          }
          if (model.schema.path(name).options.type.name === Array) {
            return 'Array';
          }
        }
      }
      if (this.model) {
        return this.model.schema.path(name).instance;
      }
    }
    return 'String';
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
  return Query.main(query);
};

module.exports.Query = Query;
