const testEndpoint = async (req, res) => {
  try {
    console.log('🧪 Test endpoint called');
    console.log('Headers:', req.headers);
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    
    res.json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      headers: req.headers,
      method: req.method,
      url: req.url
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = testEndpoint; 