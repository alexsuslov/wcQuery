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
        $exists: true
      };
    }
    if (str === '-') {
      return {
        $exists: false
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
