function noop(){}

function extend(subclass, superclass) {
  subclass.superclass = superclass;
  var proto = Object.create(superclass.prototype);
  proto.constructor = subclass;
  proto.superproto = superclass.prototype;
  subclass.prototype = proto;
}
