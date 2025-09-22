const r = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/note.controller');

r.use(auth);               // all routes below need a valid JWT
r.get('/', c.list);
r.get('/:id', c.getOne);   // optional
r.post('/', c.create);
r.put('/:id', c.update);
r.delete('/:id', c.remove);

module.exports = r;
