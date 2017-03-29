const AV = require('../libs/av-weapp-min.js');

class Brand extends AV.Object {
  get done() {
    return this.get('done');
  }
  set done(value) {
    this.set('done', value);
  }

  get content() {
    return this.get('content');
  }
  set content(value) {
    this.set('content', value);
  }
}

AV.Object.register(Brand, 'Brand');
module.exports = Brand;