require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/database');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Order Service is running', port: PORT });
});

// Sync database & start server
db.sync({ alter: true })
    .then(() => {
        console.log('Database synced successfully');
        app.listen(PORT, () => {
            console.log(`Order Service berjalan di port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Gagal sync database:', err);
    });