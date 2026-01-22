const mongoose = require('mongoose');

const booklistSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, '书单标题不能为空'],
        trim: true,
        minlength: [2, '标题至少2个字符'],
        maxlength: [100, '标题最多100个字符']
    },
    content: {
        type: String,
        required: [true, '书单内容不能为空'],
        trim: true,
        minlength: [10, '内容至少10个字符'],
        maxlength: [5000, '内容最多5000个字符']
    },
    subject: {
        type: String,
        required: [true, '请选择科目'],
        enum: [
            '语文', '数学', '英语', '道法', '物理', 
            '化学', '生物', '历史', '政治', '地理', 
            '科学', '课外阅读'
        ]
    },
    year: {
        type: Number,
        required: [true, '请选择年份'],
        min: [2000, '年份不能早于2000年'],
        max: [2100, '年份不能晚于2100年']
    },
    month: {
        type: Number,
        required: [true, '请选择月份'],
        min: [1, '月份必须为1-12'],
        max: [12, '月份必须为1-12']
    },
    bgColor: {
        type: String,
        default: '#4a90e2'
    },
    bgIndex: {
        type: Number,
        default: 0,
        min: 0,
        max: 9
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    creatorName: {
        type: String,
        required: true
    },
    viewCount: {
        type: Number,
        default: 0
    },
    likeCount: {
        type: Number,
        default: 0
    },
    commentCount: {
        type: Number,
        default: 0
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// 虚拟字段：完整日期
booklistSchema.virtual('fullDate').get(function() {
    return `${this.year}年${this.month}月`;
});

// 虚拟字段：评论
booklistSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'booklist'
});

// 索引
booklistSchema.index({ creator: 1, createdAt: -1 });
booklistSchema.index({ subject: 1, year: -1, month: -1 });
booklistSchema.index({ year: -1, month: -1, createdAt: -1 });
booklistSchema.index({ title: 'text', content: 'text' });

// 更新统计信息
booklistSchema.methods.incrementViewCount = async function() {
    this.viewCount += 1;
    await this.save();
};

booklistSchema.methods.incrementLikeCount = async function() {
    this.likeCount += 1;
    await this.save();
};

booklistSchema.methods.updateCommentCount = async function() {
    const Comment = mongoose.model('Comment');
    const count = await Comment.countDocuments({ booklist: this._id });
    this.commentCount = count;
    await this.save();
};

const Booklist = mongoose.model('Booklist', booklistSchema);

module.exports = Booklist;
