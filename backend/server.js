import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware, requireAuth } from '@clerk/express'
import connectDB from './configs/db.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware())

connectDB();


app.get('/', (req, res)=>{
    res.send('server is running....')
})

app.use(requireAuth())

const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=>{
    console.log(`Server is running on port`, PORT);
})