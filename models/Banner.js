import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a banner title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    image: {
        url: {
            type: String,
            required: [true, 'Please provide a banner image URL']
        },
        public_id: {
            type: String
        }
    },
    altText: {
        type: String,
        trim: true,
        default: 'Banner image'
    },
    link: {
        type: String,
        trim: true,
    },
    target: {
        type: String,
        enum: ['_self', '_blank'],
        default: '_self'
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

export default mongoose.models.Banner || mongoose.model('Banner', BannerSchema);
