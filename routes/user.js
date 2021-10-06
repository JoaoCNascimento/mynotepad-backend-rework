const express = require('express');
const router = express.Router();
const controller = require('../controllers/user-controller')
const {
    requireAuth
} = require('../middleware/middleware')

router.get('/', requireAuth, controller.get_user);
router.post('/', controller.post_user);
router.delete('/', requireAuth, controller.delete_user);
router.put('/', requireAuth, controller.update_user);
router.get('/login', controller.get_user_logout);
router.post('/login', controller.post_user_login);
router.patch('/validate_email', controller.email_is_valid);

module.exports = router;