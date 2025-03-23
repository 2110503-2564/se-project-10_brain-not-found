import mongoose from "mongoose";

let isConnected = false;

export const dbConnect = async () => {
    mongoose.set('strictQuery', true);

    if (isConnected) {
        console.log('MongoDB is already connected');
        return;
    }

    const MONGODB_URI = process.env.MONGO_URI;
    if (!MONGODB_URI) throw new Error('MONGODB_URI is not defined');
    
    try {
        await mongoose.connect(MONGODB_URI, {bufferCommands: false})
        isConnected = true;
        console.log('MongoDB connected');
    }catch(error) {
        console.log(error);
    }
}