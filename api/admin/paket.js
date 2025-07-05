const express = require('express');
const router = express.Router();
const Paket = require('../../models/Paket');
const { adminAuth } = require('./middleware');

// GET all paket
router.get('/', adminAuth, async (req, res) => {
  const paket = await Paket.find().populate('menu');
  res.json({ paket });
});

// CREATE paket
router.post('/', adminAuth, async (req, res) => {
  const paket = new Paket(req.body);
  await paket.save();
  res.json({ paket });
});

// UPDATE paket
router.put('/:id', adminAuth, async (req, res) => {
  const paket = await Paket.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ paket });
});

// DELETE paket
router.delete('/:id', adminAuth, async (req, res) => {
  await Paket.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;