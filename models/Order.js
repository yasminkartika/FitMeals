const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  packages: [{
    id: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }],
  delivery: {
    nama: {
      type: String,
      required: true
    },
    telepon: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    alamat: {
      type: String,
      required: true
    },
    kota: {
      type: String,
      required: true
    },
    kode_pos: {
      type: String,
      required: true
    },
    provinsi: {
      type: String,
      required: true
    },
    tanggal_mulai: {
      type: String,
      required: true
    },
    waktu: {
      type: String,
      required: true
    },
    catatan: {
      type: String,
      required: false
    }
  },
  payment: {
    method: {
      type: String,
      required: true
    },
    timestamp: {
      type: String,
      required: true
    }
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending Payment', 'Paid', 'Processing', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'],
    default: 'Pending Payment'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  paymentConfirmedAt: {
    type: Date,
    default: null
  },
  adminNotes: {
    type: String,
    default: null
  },
  statusUpdatedAt: {
    type: Date,
    default: null
  },
  statusUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
});

module.exports = mongoose.model('Order', OrderSchema); 