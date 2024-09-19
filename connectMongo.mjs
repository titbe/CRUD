import mongoose from "mongoose";

const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true, // Sử dụng trình phân tích URI mới
      useUnifiedTopology: true, // Sử dụng kiến trúc quản lý kết nối mới
    });
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default connectMongoDB;
