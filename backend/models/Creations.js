import mongoose from "mongoose";
const Schema = mongoose.Schema;

const creationSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    prompt: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'article'
    },
    publish: {
        type: Boolean,
        default: false
    },
    likes: {
        type: [String],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

creationSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
})

const Creation = mongoose.model("Creation", creationSchema);
export default Creation;