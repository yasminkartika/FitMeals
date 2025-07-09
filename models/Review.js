const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        required: true,
        maxlength: 500
    },
    packageName: {
        type: String,
        required: true
    },
    reviewDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Review', reviewSchema); 