require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/database');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 8002;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Order Service is running', port: PORT });
});

// Sync database & start server with retry logic
const startServer = async (retries = 5) => {
    while (retries > 0) {
        try {
            await db.sync({ alter: true });
            console.log('Database synced successfully');
            app.listen(PORT, () => {
                console.log(`Order Service berjalan di port ${PORT}`);
            });
            return;
        } catch (err) {
            console.error(`Gagal sync database (${retries} retries left):`, err.message);
            retries -= 1;
            if (retries === 0) {
                console.error('Max retries reached. Exiting...');
                process.exit(1);
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

startServer();