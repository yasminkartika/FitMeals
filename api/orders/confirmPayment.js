const Order = require('../../models/Order');

const confirmPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Find the order and verify ownership
    const order = await Order.findOne({ _id: orderId, userId: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pesanan tidak ditemukan'
      });
    }

    // Check if order is in pending payment status
    if (order.status !== 'Pending Payment') {
      return res.status(400).json({
        success: false,
        message: 'Pesanan tidak dalam status menunggu pembayaran'
      });
    }

    // Update order status to Paid
    order.status = 'Paid';
    order.paymentConfirmedAt = new Date();
    await order.save();

    res.json({
      success: true,
      message: 'Konfirmasi pembayaran berhasil',
      order: order
    });

  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

module.exports = confirmPayment; 