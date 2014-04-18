"use strict";

var events = require('events');
var eventEmitter = new events.EventEmitter();
var _ = require('underscore');

var gsDescriptor = {

  init: {
    value: function(obj) {
      this.obj = obj;
      return this;
    }
  },

  add: {
    enumerable: true,
    value: function(prop, descriptor) {

      var obj = this.obj;
      var _prop = '_' + prop;

      descriptor = _.extend({
        // default descriptor
        configurable: false,
        enumerable: false,
        writable: true
      }, descriptor);

      // we don't allow to set the value directly here
      if (descriptor.value) delete descriptor.value;

      // does it trigger on change?
      var triggers = descriptor.triggers || false;

      // define private properties
      Object.defineProperty(obj, _prop, descriptor);

      // d3/jquery getter(setter) paradigm
      Object.defineProperty(obj, prop, {
        enumerable: true,
        value: function(val) {

          if (arguments.length === 0) return obj[_prop];
          obj[_prop] = val;

          // bind events
          if (triggers) {
            if (!obj.hasOwnProperty('on')) obj.on = eventEmitter.on;
            if (!obj.hasOwnProperty('emit')) obj.trigger = eventEmitter.emit;
            obj.trigger(prop + ':changed', val);
          }

          return obj;
        }
      });

      return this;
    }
  }
};

// exported factory
module.exports = function getSet(object) {
  var getterSetter = Object.create({}, gsDescriptor);
  return getterSetter.init(object);
};