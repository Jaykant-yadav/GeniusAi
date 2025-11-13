import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import aiRouter from './routes/aiRoutes.js';
import { clerkMiddleware, requireAuth } from '@clerk/express'   
import connectCloudinary from './configs/cloudinary.js';

const app = express();
await connectCloudinary();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware())

connectDB();


app.get('/', (req, res) => {
    res.send('server is running....');
});


app.use(requireAuth())

app.use('/api/ai', aiRouter)

const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=>{
    console.log(`Server is running on port`, PORT);
})