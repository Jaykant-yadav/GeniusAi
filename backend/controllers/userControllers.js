import Creation from "../models/Creations.js";

export const getUserCreations = async (req, res) => {
    try {
        const { userId } = req.auth();
        const creations = await Creation.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, creations });
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const getPublishedCreations = async (req, res) => {
    try {
        const creations = await Creation.find({ publish: true }).sort({ createdAt: -1 });
        res.json({ success: true, creations });
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const toggleLikeCreation = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;
        const [creations] = await Creation.find({ id });

        if (!creations) {
            return res.json({ success: false, message: "Creation not found" })
        }

        const currentLikes = creations.likes;
        const userIdStr = userId.toString();
        let updatedLikes;
        let message;

        if (currentLikes.includes(userIdStr)) {
            updatedLikes = currentLikes.filter((user) => user !== userIdStr);
            message = 'Creation unliked'
        } else {
            updatedLikes = [...currentLikes, userIdStr]
            message = 'Creation Liked'
        }


        await Creation.findByIdAndUpdate(id, { likes }, { new: true });

        res.json({ success: true, message });
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}