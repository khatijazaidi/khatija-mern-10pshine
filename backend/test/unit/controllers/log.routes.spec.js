const { expect } = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');

const logger = require('../../../src/config/logger');
const logRouter = require('../../../src/routes/log.routes');

describe('log.routes (unit-ish via supertest)', () => {
  let app;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // stub logger levels we might call
    sandbox.stub(logger, 'info').returns(undefined);
    sandbox.stub(logger, 'error').returns(undefined);
    sandbox.stub(logger, 'warn').returns(undefined);
    sandbox.stub(logger, 'debug').returns(undefined);

    // minimal app that mounts only the log router
    app = express();
    app.use(express.json());
    app.use('/api/logs', logRouter);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('POST /api/logs (no level) -> calls logger.info and returns {success:true}', async () => {
    const res = await request(app)
      .post('/api/logs')
      .send({ message: 'hello', meta: { a: 1 } })
      .expect(200);

    expect(res.body).to.deep.equal({ success: true });
    expect(logger.info.calledOnce).to.be.true;

    // check call shape: first arg = meta object, second arg = message
    const [metaArg, msgArg] = logger.info.firstCall.args;
    expect(metaArg).to.include({ frontend: true, a: 1 });
    expect(msgArg).to.equal('hello');
  });

  it('POST /api/logs (level=error) -> calls logger.error', async () => {
    await request(app)
      .post('/api/logs')
      .send({ level: 'error', message: 'boom', meta: { code: 500 } })
      .expect(200);

    expect(logger.error.calledOnce).to.be.true;
    const [metaArg, msgArg] = logger.error.firstCall.args;
    expect(metaArg).to.include({ frontend: true, code: 500 });
    expect(msgArg).to.equal('boom');
  });

  it('POST /api/logs (unknown level) -> falls back to logger.info', async () => {
    await request(app)
      .post('/api/logs')
      .send({ level: 'weird', message: 'fallback', meta: { k: 'v' } })
      .expect(200);

    expect(logger.info.calledOnce).to.be.true;
    const [metaArg, msgArg] = logger.info.firstCall.args;
    expect(metaArg).to.include({ frontend: true, k: 'v' });
    expect(msgArg).to.equal('fallback');
  });

  it('POST /api/logs (no body at all) -> uses defaults and calls logger.info', async () => {
  const res = await request(app)
    .post('/api/logs')        // no .send()
    .expect(200);

  expect(res.body).to.deep.equal({ success: true });
  expect(logger.info.calledOnce).to.be.true;
  const [metaArg, msgArg] = logger.info.firstCall.args;
  expect(metaArg).to.include({ frontend: true });  // from defaults
  expect(msgArg).to.equal('');                     // default message ''
});

it('POST /api/logs (level=debug) -> calls logger.debug', async () => {
  await request(app)
    .post('/api/logs')
    .send({ level: 'debug', message: 'dbg' })
    .expect(200);

  expect(logger.debug.calledOnce).to.be.true;
  const [metaArg, msgArg] = logger.debug.firstCall.args;
  expect(metaArg).to.include({ frontend: true });
  expect(msgArg).to.equal('dbg');
});

});
