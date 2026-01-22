const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// 注册路由
router.post('/register', [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('nickname').notEmpty().withMessage('昵称不能为空'),
    body('password').isLength({ min: 6 }).withMessage('密码至少6个字符'),
    body('email').optional().isEmail().withMessage('请输入有效的邮箱')
], authController.register);

// 登录路由
router.post('/login', [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空')
], authController.login);

// 检查昵称是否可用
router.get('/check-nickname', authController.checkNickname);

// 获取当前用户信息
router.get('/profile', auth, authController.getProfile);

// 更新用户信息
router.put('/profile', auth, authController.updateProfile);

module.exports = router;
