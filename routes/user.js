const express = require('express');
const router = express.Router();
const controller = require('../controllers/user-controller')
const {
    requireAuth
} = require('../middleware/middleware')

// router.get('/cadastrar', controller.sign_up_get);
// router.post('/cadastrar', controller.sign_up_post);
// router.get('/login', controller.login_get)
// router.post('/login', controller.login_post);
// router.get('/log_out', controller.log_out_get);
// router.delete('/excluir_conta', requireAuth, controller.delete_user)

router.get('/', requireAuth, controller.get_user);
router.post('/', controller.post_user);
router.delete('/', requireAuth, controller.delete_user);
router.put('/', requireAuth, controller.update_user);
router.get('/login', controller.get_user_logout);
router.post('/login', controller.post_user_login);

module.exports = router;