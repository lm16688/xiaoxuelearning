const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, '评论内容不能为空'],
        trim: true,
        minlength: [1, '评论至少1个字符'],
        maxlength: [500, '评论最多500个字符']
    },
    booklist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booklist',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// 索引
commentSchema.index({ booklist: 1, createdAt: -1 });
commentSchema.index({ user: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });

// 软删除
commentSchema.methods.softDelete = async function() {
    this.isDeleted = true;
    this.content = '[评论已删除]';
    await this.save();
};

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
