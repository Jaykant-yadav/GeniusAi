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
        const creation = await Creation.findById(id);

        if (!creation) {
            return res.json({ success: false, message: "Creation not found" })
        }

        const userIdStr = userId.toString();
        let updatedLikes;
        let message;

        if (creation.likes.includes(userIdStr)) {
            // Unlike
            updatedLikes = creation.likes.filter(uid => uid !== userIdStr);
            message = "Creation unliked";
        } else {
            // Like
            updatedLikes = [...creation.likes, userIdStr];
            message = "Creation liked";
        }

        await Creation.findByIdAndUpdate(
            id,
            { likes: updatedLikes, updatedAt: Date.now() },
            { new: true }
        );

        res.json({ success: true, message });
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}