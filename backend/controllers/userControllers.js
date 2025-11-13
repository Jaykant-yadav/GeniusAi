
export const getUserCreations = async (req, res) => {
    try {
        const { userId } = req.auth();
    } catch (e) {
        res.json({ success: false, message: error.message })
    }
}