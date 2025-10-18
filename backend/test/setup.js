const sinon = require('sinon');

exports.mochaHooks = {
  beforeEach() {
    this.sandbox = sinon.createSandbox();
  },
  afterEach() {
    this.sandbox.restore();
  }
};
