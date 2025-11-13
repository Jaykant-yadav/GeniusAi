import { clerkClient } from "@clerk/express";
import OpenAI from "openai";
import axios from 'axios';
import Creation from '../models/Creations.js';
import { v2 as cloudinary } from 'cloudinary';
import FormData from 'form-data'
import fs from fs;
import pdf from 'pdf-parse/lib/pdf-parse.js'


const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

// Generate Article
export const generateArticle = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan != 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached. Upgrade to continue." })
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: length,
        });

        const content = response.choices[0].message.content;

        const savedDoc = await Creation.create({
            userId,
            prompt,
            content,
            type: 'article',
            publish: false
        })

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({ success: true, content, id: savedDoc._id })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

// Generate Blog Title
export const generateBlogTitle = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { prompt } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan != 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached. Upgrade to continue." })
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{ role: "user", content: prompt, }],
            temperature: 0.7,
            max_tokens: 100,
        });

        const content = response.choices[0].message.content;

        const savedDoc = await Creation.create({
            userId,
            prompt,
            content,
            type: 'blog-title',
            publish: false
        })

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({ success: true, content, id: savedDoc._id })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

// Generate Image
export const generateImage = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { prompt, publish } = req.body;
        const plan = req.plan;

        // 1️ Check plan
        if (plan !== "premium") {
            return res.json({
                success: false,
                message: "This feature is only available for premium subscriptions.",
            });
        }

        // 2️ Request image from ClipDrop
        const formData = new FormData();
        formData.append("prompt", prompt);

        const response = await axios.post(
            "https://clipdrop-api.co/text-to-image/v1",
            formData,
            {
                headers: {
                    "x-api-key": process.env.CLIPDROP_API_KEY,
                    ...formData.getHeaders(),
                },
                responseType: "arraybuffer",
            }
        );

        // 3️ Convert to Base64 — NO SPACE after comma!
        const base64Image = `data:image/png;base64,${Buffer.from(
            response.data,
            "binary"
        ).toString("base64")}`;

        // 4️ Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(base64Image, {
            folder: "geniusai/images",
            resource_type: "image",
        });

        // 5️ Save in DB
        const savedDoc = await Creation.create({
            userId,
            prompt,
            content: uploadResult.secure_url,
            type: "image",
            publish: Boolean(publish),
        });

        // 6️ Return success
        res.json({
            success: true,
            content: uploadResult.secure_url,
            id: savedDoc._id,
        });
    } catch (error) {
        console.error("Image Generation Error:", error);
        res.json({
            success: false,
            message: error?.response?.data || error?.message || String(error),
        });
    }
}

// Remove Image Background
export const removeImageBackground = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { image } = req.file;
        const plan = req.plan;

        // 1️ Check plan
        if (plan !== "premium") {
            return res.json({
                success: false,
                message: "This feature is only available for premium subscriptions.",
            });
        }

        // 2 Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(image.path, {
            transformation: [
                {
                    effect: 'background_removal',
                    background_removal: 'remove_the_background'
                }
            ]
        });

        // 3 Save in DB
        const savedDoc = await Creation.create({
            userId,
            prompt: "Remove background from image",
            content: uploadResult.secure_url,
            type: "image",
        });

        // 4 Return success
        res.json({
            success: true,
            content: uploadResult.secure_url,
            id: savedDoc._id,
        });
    } catch (error) {
        console.error("Image Generation Error:", error);
        res.json({
            success: false,
            message: error?.response?.data || error?.message || String(error),
        });
    }
}


// Remove Image Object
export const removeImageObject = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { object } = req.body;
        const { image } = req.file;
        const plan = req.plan;

        // 1️ Check plan
        if (plan !== "premium") {
            return res.json({
                success: false,
                message: "This feature is only available for premium subscriptions.",
            });
        }

        // 2 Upload to Cloudinary
        const {public_id} = await cloudinary.uploader.upload(image.path);

        const imageUrl = cloudinary.url(public_id, {
            transformation: [{effect: `gen_remove:${object}`}],
            resource_type: 'image'
        })

        // 3 Save in DB
        const savedDoc = await Creation.create({
            userId,
            prompt: `Remove ${object} from image`,
            content: imageUrl,
            type: "image",
        });

        // 4 Return success
        res.json({
            success: true,
            content: imageUrl,
            id: savedDoc._id,
        });
    } catch (error) {
        console.error("Image Generation Error:", error);
        res.json({
            success: false,
            message: error?.response?.data || error?.message || String(error),
        });
    }
}

// Review Resume
export const resumeReview = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const resume = req.file;
        const plan = req.plan;

        // 1️ Check plan
        if (plan !== "premium") {
            return res.json({
                success: false,
                message: "This feature is only available for premium subscriptions.",
            });
        }

        if(resume.size > 5 * 1024 * 1024){
            return res.json({success: false, message: "Resume file size exceeds allowed size (5MB)."})
        }

        const dataBuffer = fs.readFileSync(resume.path);
        const pdfData = await pdf(dataBuffer);

        const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Resume Content:\n\n${pdfData.text}`

         const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });

        const content = response.choices[0].message.content;
        // 3 Save in DB
        const savedDoc = await Creation.create({
            userId,
            prompt: "Review the uploaded Resume",
            content,
            type: "resume-review",
        });

        // 4 Return success
        res.json({
            success: true,
            content,
            id: savedDoc._id,
        });
    } catch (error) {
        console.error("Image Generation Error:", error);
        res.json({
            success: false,
            message: error?.response?.data || error?.message || String(error),
        });
    }
}