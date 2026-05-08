import mongoose from 'mongoose';

const connectDB = async () =>{
    await mongoose.connect('mongodb+srv://Spicyfood:12345@cluster0.ng4fsne.mongodb.net/spicyfood').then(()=>console.log("DB Connected"));
}