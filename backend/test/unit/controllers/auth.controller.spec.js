const { expect } = require('chai');

const AuthCtrl = require('../../../src/controllers/auth.controller');
const User     = require('../../../src/models/User');
const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const logger   = require('../../../src/config/logger');

const { mockReq, mockRes, mockNext } = require('../../helpers/mockExpress');

describe('auth.controller (unit)', () => {
  beforeEach(function () {
    // Silence logs in tests
    this.sandbox.stub(logger, 'info').returns(undefined);
    // Provide test secrets to avoid undefined
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES = '1d';
  });

  /* ========== REGISTER ========== */

  it('register: 400 when missing fields', async function () {
    const req = mockReq({ body: { email: 'a@a.com' } }); // no name/password
    const res = mockRes();

    await AuthCtrl.register(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.firstCall.args[0]).to.have.property('message');
  });

  it('register: 400 when email already in use', async function () {
    const { sandbox } = this;
    const req = mockReq({ body: { name: 'A', email: 'a@a.com', password: 'P@ss1!' } });
    const res = mockRes();

    sandbox.stub(User, 'findOne').resolves({ _id: 'u1' });

    await AuthCtrl.register(req, res);

    expect(User.findOne.calledWith({ email: 'a@a.com' })).to.be.true;
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.firstCall.args[0].message).to.match(/Email already in use/i);
  });

  it('register: 201 success, returns public user', async function () {
    const { sandbox } = this;
    const req = mockReq({ body: { name: 'A', email: 'a@a.com', password: 'P@ss1!' } });
    const res = mockRes();

    sandbox.stub(User, 'findOne').resolves(null);
    sandbox.stub(bcrypt, 'hash').resolves('hashed');
    sandbox.stub(User, 'create').resolves({ _id: 'u1', name: 'A', email: 'a@a.com' });

    await AuthCtrl.register(req, res);

    expect(User.findOne.calledWith({ email: 'a@a.com' })).to.be.true;
    expect(bcrypt.hash.calledWith('P@ss1!', 10)).to.be.true;
    expect(User.create.calledWithMatch({ name: 'A', email: 'a@a.com', password: 'hashed' })).to.be.true;

    expect(res.status.calledWith(201)).to.be.true;
    const payload = res.json.firstCall.args[0];
    expect(payload).to.have.property('user');
    expect(payload.user).to.include({ id: 'u1', name: 'A', email: 'a@a.com' });
  });

  /* ========== LOGIN ========== */

  it('login: 400 when missing email or password', async function () {
    const req = mockReq({ body: { email: 'a@a.com' } }); // no password
    const res = mockRes();

    await AuthCtrl.login(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.firstCall.args[0].message).to.match(/required/i);
  });

  it('login: 401 when user not found', async function () {
    const { sandbox } = this;
    const req = mockReq({ body: { email: 'a@a.com', password: 'x' } });
    const res = mockRes();

    sandbox.stub(User, 'findOne').resolves(null);

    await AuthCtrl.login(req, res);

    expect(User.findOne.calledWith({ email: 'a@a.com' })).to.be.true;
    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.firstCall.args[0].message).to.match(/Invalid credentials/i);
  });

  it('login: 401 when password invalid', async function () {
    const { sandbox } = this;
    const req = mockReq({ body: { email: 'a@a.com', password: 'wrong' } });
    const res = mockRes();

    sandbox.stub(User, 'findOne').resolves({ _id: 'u1', email: 'a@a.com', password: 'hash' });
    sandbox.stub(bcrypt, 'compare').resolves(false);

    await AuthCtrl.login(req, res);

    expect(bcrypt.compare.calledOnce).to.be.true;
    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.firstCall.args[0].message).to.match(/Invalid credentials/i);
  });

  it('login: 200 success, returns { token, user }', async function () {
    const { sandbox } = this;
    const req = mockReq({ body: { email: 'a@a.com', password: 'P@ss1!' } });
    const res = mockRes();

    sandbox.stub(User, 'findOne').resolves({ _id: 'u1', email: 'a@a.com', name: 'A', password: 'hash' });
    sandbox.stub(bcrypt, 'compare').resolves(true);
    sandbox.stub(jwt, 'sign').returns('stub.jwt.token');

    await AuthCtrl.login(req, res);

    expect(jwt.sign.calledOnce).to.be.true;

    // login sends 200 by default (no res.status set), so check the body
    const body = res.json.firstCall.args[0];
    expect(body).to.have.property('token', 'stub.jwt.token');
    expect(body).to.have.property('user');
    expect(body.user).to.include({ id: 'u1', name: 'A', email: 'a@a.com' });
  });

  /* ========== FORGOT PASSWORD ========== */

  it('forgotPassword: 400 if email/newPassword missing', async function () {
    const req = mockReq({ body: { email: 'a@a.com' } }); // no newPassword
    const res = mockRes();

    await AuthCtrl.forgotPassword(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.firstCall.args[0].message).to.match(/required/i);
  });

  it('forgotPassword: 400 if newPassword < 6', async function () {
    const req = mockReq({ body: { email: 'a@a.com', newPassword: '123' } });
    const res = mockRes();

    await AuthCtrl.forgotPassword(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.firstCall.args[0].message).to.match(/at least 6/i);
  });

  it('forgotPassword: 200 generic message when user not found', async function () {
    const { sandbox } = this;
    const req = mockReq({ body: { email: 'missing@x.com', newPassword: 'NewPass1' } });
    const res = mockRes();

    sandbox.stub(User, 'findOne').resolves(null);

    await AuthCtrl.forgotPassword(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.firstCall.args[0].message).to.match(/If the account exists/i);
  });

  it('forgotPassword: 200 success updates password & saves', async function () {
    const { sandbox } = this;
    const req = mockReq({ body: { email: 'a@a.com', newPassword: 'NewPass1' } });
    const res = mockRes();

    const fakeUser = { _id: 'u1', email: 'a@a.com', save: sandbox.stub().resolves() };

    sandbox.stub(User, 'findOne').resolves(fakeUser);
    sandbox.stub(bcrypt, 'hash').resolves('newhashed');

    await AuthCtrl.forgotPassword(req, res);

    expect(bcrypt.hash.calledWith('NewPass1', 10)).to.be.true;
    expect(fakeUser.save.calledOnce).to.be.true;

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.firstCall.args[0].message).to.match(/Password updated successfully/i);
  });

  /* ========== ME ========== */

  it('me: returns req.user as { user }', async function () {
    const req = mockReq({ user: { id: 'u1', email: 'a@a.com' } });
    const res = mockRes();

    await AuthCtrl.me(req, res);

    const body = res.json.firstCall.args[0];
    expect(body).to.have.property('user');
    expect(body.user).to.deep.equal({ id: 'u1', email: 'a@a.com' });
  });
});
