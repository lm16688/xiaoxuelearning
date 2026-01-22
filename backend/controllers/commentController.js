const Comment = require('../models/Comment');
const Booklist = require('../models/Booklist');
const { validationResult } = require('express-validator');

// 添加评论
exports.addComment = async (req, res) => {
    try {
        // 验证输入
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const { booklistId } = req.params;
        const { content, parentCommentId } = req.body;
        
        // 检查书单是否存在
        const booklist = await Booklist.findById(booklistId);
        if (!booklist) {
            return res.status(404).json({
                success: false,
                message: '书单不存在'
            });
        }
        
        // 创建评论
        const comment = new Comment({
            content,
            booklist: booklistId,
            user: req.user._id,
            userName: req.user.nickname,
            parentComment: parentCommentId || null
        });
        
        await comment.save();
        
        // 更新书单的评论数量
        await booklist.updateCommentCount();
        
        // 填充用户信息
        await comment.populate('user', 'nickname avatar');
        
        res.status(201).json({
            success: true,
            message: '评论添加成功',
            data: { comment }
        });
    } catch (error) {
        console.error('添加评论错误:', error);
        res.status(500).json({
            success: false,
            message: '添加评论失败'
        });
    }
};

// 获取书单的评论
exports.getComments = async (req, res) => {
    try {
        const { booklistId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const comments = await Comment.find({
            booklist: booklistId,
            isDeleted: false,
            parentComment: null // 只获取顶级评论
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'nickname avatar')
        .populate({
            path: 'replies',
            match: { isDeleted: false },
            populate: {
                path: 'user',
                select: 'nickname avatar'
            },
            options: { sort: { createdAt: 1 } }
        });
        
        const total = await Comment.countDocuments({
            booklist: booklistId,
            isDeleted: false,
            parentComment: null
        });
        
        res.json({
            success: true,
            data: {
                comments,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('获取评论错误:', error);
        res.status(500).json({
            success: false,
            message: '获取评论失败'
        });
    }
};

// 更新评论
exports.updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        
        // 查找评论
        const comment = await Comment.findById(commentId);
        
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: '评论不存在'
            });
        }
        
        // 检查权限
        if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '没有权限修改此评论'
            });
        }
        
        // 更新评论
        comment.content = content;
        comment.isEdited = true;
        comment.editedAt = new Date();
        
        await comment.save();
        
        res.json({
            success: true,
            message: '评论更新成功',
            data: { comment }
        });
    } catch (error) {
        console.error('更新评论错误:', error);
        res.status(500).json({
            success: false,
            message: '更新评论失败'
        });
    }
};

// 删除评论
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        
        // 查找评论
        const comment = await Comment.findById(commentId);
        
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: '评论不存在'
            });
        }
        
        // 检查权限
        if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '没有权限删除此评论'
            });
        }
        
        // 软删除评论
        await comment.softDelete();
        
        // 更新书单的评论数量
        const booklist = await Booklist.findById(comment.booklist);
        if (booklist) {
            await booklist.updateCommentCount();
        }
        
        res.json({
            success: true,
            message: '评论删除成功'
        });
    } catch (error) {
        console.error('删除评论错误:', error);
        res.status(500).json({
            success: false,
            message: '删除评论失败'
        });
    }
};

// 点赞评论
exports.likeComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        
        const comment = await Comment.findById(commentId);
        
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: '评论不存在'
            });
        }
        
        // 检查用户是否已经点赞
        const userId = req.user._id;
        const alreadyLiked = comment.likes.includes(userId);
        
        if (alreadyLiked) {
            // 取消点赞
            comment.likes = comment.likes.filter(like => like.toString() !== userId.toString());
        } else {
            // 添加点赞
            comment.likes.push(userId);
        }
        
        await comment.save();
        
        res.json({
            success: true,
            message: alreadyLiked ? '取消点赞成功' : '点赞成功',
            data: {
                likes: comment.likes.length,
                liked: !alreadyLiked
            }
        });
    } catch (error) {
        console.error('点赞评论错误:', error);
        res.status(500).json({
            success: false,
            message: '操作失败'
        });
    }
};
