const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('./middleware');
const confirmPayment = require('./orders/confirmPayment');

// Create new order
router.post('/create', auth, async (req, res) => {
    try {
        const {
            packages,
            delivery,
            payment,
            totalAmount
        } = req.body;

        const order = new Order({
            userId: req.user.id,
            packages: packages,
            delivery: delivery,
            payment: payment,
            totalAmount: totalAmount,
            status: 'Pending Payment',
            orderDate: new Date()
        });

        await order.save();

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: order
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    }
});

// Get user orders
router.get('/user', auth, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .sort({ orderDate: -1 });

        res.json({
            success: true,
            orders: orders
        });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
});

// Get all orders (admin only)
router.get('/all', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const orders = await Order.find()
            .populate('userId', 'namaLengkap email')
            .sort({ orderDate: -1 });

        res.json({
            success: true,
            orders: orders
        });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
});

// Update order status (admin only)
router.put('/:orderId/status', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.orderId,
            { status: status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'Order status updated successfully',
            order: order
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
});

// Cancel order (user can cancel their own pending payment orders)
router.put('/:orderId/cancel', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns this order
        if (order.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only cancel your own orders.'
            });
        }

        // Check if order can be cancelled (only pending payment orders)
        if (order.status !== 'Pending Payment') {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled. Only pending payment orders can be cancelled.'
            });
        }

        // Update order status to cancelled
        order.status = 'Dibatalkan';
        await order.save();

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            order: order
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel order',
            error: error.message
        });
    }
});

// Confirm payment
router.put('/:orderId/confirm-payment', auth, confirmPayment);

module.exports = router; 