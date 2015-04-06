function extend(subclass, superclass) {
  subclass.superclass = superclass;
  var proto = Object.create(superclass.prototype);
  proto.constructor = subclass;
  subclass.prototype = proto;
}
