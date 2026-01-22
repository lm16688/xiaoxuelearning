const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/booklist_system', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`✅ MongoDB连接成功: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB连接失败: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
