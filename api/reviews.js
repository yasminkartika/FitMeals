const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const auth = require('./middleware');

// Create new review
router.post('/create', auth, async (req, res) => {
    try {
        const {
            orderId,
            rating,
            review,
            packageName
        } = req.body;

        const newReview = new Review({
            userId: req.user.id,
            orderId: orderId,
            rating: rating,
            review: review,
            packageName: packageName,
            reviewDate: new Date()
        });

        await newReview.save();

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            review: newReview
        });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit review',
            error: error.message
        });
    }
});

// Get all reviews for testimonials (public)
router.get('/testimonials', async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('userId', 'namaLengkap')
            .sort({ reviewDate: -1 })
            .limit(10); // Limit to 10 latest reviews

        res.json({
            success: true,
            reviews: reviews
        });
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch testimonials',
            error: error.message
        });
    }
});

// Get user reviews
router.get('/user', auth, async (req, res) => {
    try {
        const reviews = await Review.find({ userId: req.user.id })
            .sort({ reviewDate: -1 });

        res.json({
            success: true,
            reviews: reviews
        });
    } catch (error) {
        console.error('Error fetching user reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user reviews',
            error: error.message
        });
    }
});

module.exports = router; 