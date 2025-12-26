const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const { authenticate, authorize, checkOwnership } = require('../middleware/auth');


router.post('/register', userController.create);
router.post('/login', userController.login);
router.post('/refresh-token', userController.refreshToken); 
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.get('/verify-email', userController.verifyEmail);
router.post('/resend-verification', userController.resendVerification);
router.get('/check-email', userController.checkEmail);



router.use(authenticate);  

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.patch('/profile/password', userController.changePassword);
router.delete('/profile', userController.deleteAccount);
router.post('/logout', userController.logout);

router.get('/', userController.getAll);
router.get('/email/:email', userController.getByEmail);
router.get('/:id', userController.getById);
router.put('/:id', checkOwnership, userController.update);
router.patch('/:id/password', checkOwnership, userController.updatePassword);
router.delete('/:id', checkOwnership, userController.delete);

router.get('/stats', authorize('admin'), userController.getStats);
router.patch('/:id/role', authorize('admin'), userController.updateRole);
router.patch('/:id/verify', authorize('admin'), userController.manualVerify);
router.patch('/:id/ban', authorize('admin'), userController.banUser);
router.patch('/:id/unban', authorize('admin'), userController.unbanUser);
router.get('/search', authorize('admin'), userController.searchUsers);

module.exports = router;