const express = require('express');
const middleware = require('../middleware/middleware');
const controller = require('../controllers/notepad-controller');
const router = express.Router();

router.use(middleware.requireAuth);

router.get('/', controller.notepad);
router.get('/criar_anotacao', controller.note_get);
router.post('/criar_anotacao', controller.note_post);
router.get('/editar_anotacao/:id', controller.note_edit_get);
router.delete('/excluir_anotacao/:id', controller.note_delete);
router.put('/alterar_anotacao/:id', controller.note_put);
router.get('/meu_perfil', controller.user_profile);

module.exports = router;