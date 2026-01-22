const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const booklistController = require('../controllers/booklistController');
const { auth, optionalAuth } = require('../middleware/auth');

// 获取所有书单
router.get('/', optionalAuth, booklistController.getAllBooklists);

// 创建书单
router.post('/', auth, [
    body('title').notEmpty().withMessage('标题不能为空'),
    body('content').notEmpty().withMessage('内容不能为空'),
    body('subject').notEmpty().withMessage('请选择科目'),
    body('year').isInt({ min: 2000, max: 2100 }).withMessage('请选择有效的年份'),
    body('month').isInt({ min: 1, max: 12 }).withMessage('请选择有效的月份'),
    body('bgIndex').optional().isInt({ min: 0, max: 9 }).withMessage('背景索引无效')
], booklistController.createBooklist);

// 获取单个书单
router.get('/:id', optionalAuth, [
    param('id').isMongoId().withMessage('无效的书单ID')
], booklistController.getBooklist);

// 更新书单
router.put('/:id', auth, [
    param('id').isMongoId().withMessage('无效的书单ID')
], booklistController.updateBooklist);

// 删除书单
router.delete('/:id', auth, [
    param('id').isMongoId().withMessage('无效的书单ID')
], booklistController.deleteBooklist);

// 点赞书单
router.post('/:id/like', auth, [
    param('id').isMongoId().withMessage('无效的书单ID')
], booklistController.likeBooklist);

// 获取用户的书单
router.get('/user/:userId', optionalAuth, [
    param('userId').isMongoId().withMessage('无效的用户ID')
], booklistController.getUserBooklists);

module.exports = router;
