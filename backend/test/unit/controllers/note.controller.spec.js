const { expect } = require('chai');
const sinon = require('sinon');

// ✅ Adjusted all paths based on your folder layout
const NoteCtrl = require('../../../src/controllers/note.controller');
const Note     = require('../../../src/models/Note');
const logger   = require('../../../src/config/logger');

// ✅ Correct relative path to your mock helper
const { mockReq, mockRes } = require('../../helpers/mockExpress');

describe('note.controller (unit)', () => {
  beforeEach(function () {
    this.sandbox = sinon.createSandbox();
    // Silence log output during testing
    this.sandbox.stub(logger, 'info').returns(undefined);
  });

  afterEach(function () {
    this.sandbox.restore();
  });

  /* ========== LIST (GET /api/notes) ========== */
  it('list: returns notes for req.user.id, sorted by updatedAt desc', async function () {
    const req = mockReq({ user: { id: 'u1' } });
    const res = mockRes();

    // Mock Note.find() returning object with sort()
    const sortStub = this.sandbox.stub().resolves([{ _id: 'n1' }, { _id: 'n2' }]);
    this.sandbox.stub(Note, 'find').returns({ sort: sortStub });

    await NoteCtrl.list(req, res);

    expect(Note.find.calledWith({ user: 'u1' })).to.be.true;
    expect(sortStub.calledWith({ updatedAt: -1 })).to.be.true;

    const payload = res.json.firstCall.args[0];
    expect(payload).to.have.property('notes').that.is.an('array').with.length(2);
  });

  /* ========== GET ONE (GET /api/notes/:id) ========== */
  it('getOne: 200 with note when found', async function () {
    const req = mockReq({ user: { id: 'u1' }, params: { id: 'n1' } });
    const res = mockRes();

    this.sandbox.stub(Note, 'findOne').resolves({ _id: 'n1', user: 'u1' });

    await NoteCtrl.getOne(req, res);

    expect(Note.findOne.calledWith({ _id: 'n1', user: 'u1' })).to.be.true;
    const payload = res.json.firstCall.args[0];
    expect(payload).to.have.property('note');
    expect(payload.note).to.include({ _id: 'n1' });
  });

  it('getOne: 404 when not found', async function () {
    const req = mockReq({ user: { id: 'u1' }, params: { id: 'nX' } });
    const res = mockRes();

    this.sandbox.stub(Note, 'findOne').resolves(null);

    await NoteCtrl.getOne(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.firstCall.args[0].message).to.match(/Not found/i);
  });

  /* ========== CREATE (POST /api/notes) ========== */
  it('create: 201 and returns created note; logs event', async function () {
    const req = mockReq({
      user: { id: 'u1' },
      body: { title: 'T', content: '<p>X</p>' }
    });
    const res = mockRes();

    this.sandbox.stub(Note, 'create').resolves({
      _id: 'n1',
      title: 'T',
      content: '<p>X</p>',
      user: 'u1'
    });

    await NoteCtrl.create(req, res);

    expect(Note.create.calledWithMatch({
      user: 'u1',
      title: 'T',
      content: '<p>X</p>'
    })).to.be.true;
    expect(logger.info.calledOnce).to.be.true;

    expect(res.status.calledWith(201)).to.be.true;
    const payload = res.json.firstCall.args[0];
    expect(payload).to.have.property('note');
    expect(payload.note).to.include({ _id: 'n1', title: 'T' });
  });

  /* ========== UPDATE (PUT /api/notes/:id) ========== */
  it('update: 200 and returns updated note; logs event', async function () {
    const req = mockReq({
      user: { id: 'u1' },
      params: { id: 'n1' },
      body: { title: 'T2', content: 'Y' }
    });
    const res = mockRes();

    const fn = this.sandbox.stub(Note, 'findOneAndUpdate')
      .resolves({ _id: 'n1', title: 'T2', content: 'Y', user: 'u1' });

    await NoteCtrl.update(req, res);

    expect(fn.calledWithMatch(
      { _id: 'n1', user: 'u1' },
      { $set: { title: 'T2', content: 'Y' } },
      { new: true }
    )).to.be.true;

    expect(logger.info.calledOnce).to.be.true;

    const payload = res.json.firstCall.args[0];
    expect(payload).to.have.property('note');
    expect(payload.note).to.include({ _id: 'n1', title: 'T2' });
  });

  it('update: 404 when not found', async function () {
    const req = mockReq({
      user: { id: 'u1' },
      params: { id: 'n404' },
      body: { title: 'NA', content: 'NA' }
    });
    const res = mockRes();

    this.sandbox.stub(Note, 'findOneAndUpdate').resolves(null);

    await NoteCtrl.update(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.firstCall.args[0].message).to.match(/Not found/i);
  });

  /* ========== REMOVE (DELETE /api/notes/:id) ========== */
  it('remove: 200 and returns success; logs event', async function () {
    const req = mockReq({ user: { id: 'u1' }, params: { id: 'n1' } });
    const res = mockRes();

    this.sandbox.stub(Note, 'findOneAndDelete').resolves({ _id: 'n1' });

    await NoteCtrl.remove(req, res);

    expect(Note.findOneAndDelete.calledWith({ _id: 'n1', user: 'u1' })).to.be.true;
    expect(logger.info.calledOnce).to.be.true;

    const payload = res.json.firstCall.args[0];
    expect(payload).to.deep.equal({ success: true });
  });

  it('remove: 404 when not found', async function () {
    const req = mockReq({ user: { id: 'u1' }, params: { id: 'nX' } });
    const res = mockRes();

    this.sandbox.stub(Note, 'findOneAndDelete').resolves(null);

    await NoteCtrl.remove(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.firstCall.args[0].message).to.match(/Not found/i);
  });
});
