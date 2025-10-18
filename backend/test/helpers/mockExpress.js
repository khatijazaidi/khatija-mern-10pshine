const sinon = require('sinon');

function mockReq(overrides = {}) {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    ...overrides,
  };
}

function mockRes() {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.json   = sinon.stub().returns(res);
  res.cookie = sinon.stub().returns(res);
  res.clearCookie = sinon.stub().returns(res);
  return res;
}

function mockNext() {
  return sinon.stub();
}

module.exports = { mockReq, mockRes, mockNext };