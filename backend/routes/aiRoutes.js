import express from 'express';
import { auth } from '../middleware/auth.js';
import { generateArticle, generateBlogTitle, generateImage, removeImageBackground, removeImageObject, resumeReview } from '../controllers/aiControllers.js';
import { uploadImage, uploadPDF } from '../configs/multer.js';
const aiRouter = express.Router();

aiRouter.post('/generate-article', auth, generateArticle)
aiRouter.post('/generate-blog-title', auth, generateBlogTitle)
aiRouter.post('/generate-image', auth, generateImage)
aiRouter.post('/remove-image-background', uploadImage.single('image'), auth, removeImageBackground)
aiRouter.post('/remove-image-object', uploadImage.single('image'), auth, removeImageObject)
aiRouter.post('/resume-review', uploadPDF.single('resume'), auth, resumeReview)

export default aiRouter;