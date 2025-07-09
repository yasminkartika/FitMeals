const User = require('../../models/User');

const verifyAdminToken = async (req, res) => {
  try {
    console.log('🔍 Verifying admin token...');
    
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No Bearer token found');
      return res.status(401).json({
        valid: false,
        message: 'Token tidak ditemukan'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('Token:', token);
    
    if (!token) {
      console.log('❌ Empty token');
      return res.status(401).json({
        valid: false,
        message: 'Token tidak valid'
      });
    }

    // Parse admin token format: admin_${userId}_${timestamp}
    const tokenParts = token.split('_');
    console.log('Token parts:', tokenParts);
    
    if (tokenParts.length < 3 || tokenParts[0] !== 'admin') {
      console.log('❌ Invalid token format');
      return res.status(401).json({
        valid: false,
        message: 'Token tidak valid'
      });
    }

    const userId = tokenParts[1];
    const timestamp = tokenParts[2];
    
    console.log('User ID:', userId);
    console.log('Timestamp:', timestamp);

    // Check if token is not too old (24 hours)
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    console.log('Token age:', tokenAge, 'ms');
    console.log('Max age:', maxAge, 'ms');
    
    if (tokenAge > maxAge) {
      console.log('❌ Token expired');
      return res.status(401).json({
        valid: false,
        message: 'Token telah kadaluarsa'
      });
    }

    // Check if user exists and is admin
    console.log('🔍 Finding user with ID:', userId);
    const user = await User.findById(userId);
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({
        valid: false,
        message: 'User tidak ditemukan'
      });
    }

    console.log('User role:', user.role);
    if (user.role !== 'admin') {
      console.log('❌ User is not admin');
      return res.status(403).json({
        valid: false,
        message: 'Akses ditolak. Admin only.'
      });
    }

    console.log('✅ Token verification successful');
    // Token is valid and user is admin
    res.json({
      valid: true,
      message: 'Token valid',
      user: {
        id: user._id,
        namaLengkap: user.namaLengkap,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Token verification error:', error);
    
    res.status(500).json({
      valid: false,
      message: 'Terjadi kesalahan server: ' + error.message
    });
  }
};

module.exports = verifyAdminToken; 