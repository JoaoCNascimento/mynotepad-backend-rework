const express = require('express');
const {requireAuth} = require('../middleware/middleware');
const controller = require('../controllers/notes-controller');
const router = express.Router();

router.use(requireAuth);

router.get('/', controller.get_notes);
router.get('/:id', controller.get_note);
router.post('/', controller.post_note);
router.put('/:id', controller.put_note);
router.delete('/:id',controller.delete_note);

module.exports = router;