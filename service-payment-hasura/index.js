require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const db = require('./config/database');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { seedPaymentMethods } = require('./seeders/seed');

const app = express();
const PORT = process.env.PORT || 8003;

async function startServer() {
    // Create Apollo Server
    const apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
        introspection: true,
    });

    // Start Apollo Server
    await apolloServer.start();
    console.log('Apollo Server started');

    // Middleware
    app.use(cors());
    app.use(express.json());

    // GraphQL endpoint
    app.use('/graphql', expressMiddleware(apolloServer, {
        context: async ({ req }) => ({
            // Context bisa diisi dengan auth info jika diperlukan
            headers: req.headers,
        }),
    }));

    // Health check endpoint
    app.get('/', (req, res) => {
        res.json({
            message: 'Payment Service is running',
            port: PORT,
            endpoints: {
                graphql_manual: `http://localhost:${PORT}/graphql`,
                hasura_console: 'http://localhost:8080',
            },
        });
    });

    // Sync database & seed data
    await db.sync({ alter: true });
    console.log('Database synced successfully');

    // Seed payment methods
    await seedPaymentMethods();

    // Start server
    app.listen(PORT, () => {
        console.log(`Payment Service (Apollo Server) berjalan di port ${PORT}`);
        console.log(`GraphQL Playground: http://localhost:${PORT}/graphql`);
    });
}

startServer().catch((err) => {
    console.error('Gagal startup Payment Service:', err);
    process.exit(1);
});
