const axios = require('axios');

const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
        }

        const token = authHeader.split(' ')[1];
        const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:8000';

        // Panggil User Service untuk validasi token dan mendapatkan profile
        const response = await axios.get(`${userServiceUrl}/api/auth/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        // Laravel API mengembalikan { data: { id, name, email, ... } }
        // Kita simpan ke req.user agar bisa dibaca oleh OrderController
        req.user = response.data.data || response.data;
        
        next();
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return res.status(401).json({ message: 'Sesi berakhir atau token tidak valid. Silakan login kembali.' });
        }
        console.error('Auth Middleware Error:', error.message);
        return res.status(500).json({ message: 'Terjadi kesalahan internal saat memverifikasi token.', error: error.message });
    }
};

module.exports = { requireAuth };
