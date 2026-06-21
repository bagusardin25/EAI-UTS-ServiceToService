const typeDefs = `#graphql
    type PaymentMethod {
        id: ID!
        name: String!
        code: String!
        is_active: Boolean!
        payments: [Payment!]
        created_at: String
        updated_at: String
    }

    type Payment {
        id: ID!
        payment_number: String!
        order_id: Int!
        user_id: Int!
        payment_method_id: Int
        amount: Float!
        status: String!
        paid_at: String
        notes: String
        payment_method: PaymentMethod
        created_at: String
        updated_at: String
    }

    type Query {
        """Ambil semua pembayaran"""
        payments: [Payment!]!

        """Ambil pembayaran berdasarkan ID"""
        payment(id: ID!): Payment

        """Ambil pembayaran berdasarkan Order ID"""
        paymentsByOrder(orderId: ID!): [Payment!]!

        """Ambil pembayaran berdasarkan User ID"""
        paymentsByUser(userId: ID!): [Payment!]!

        """Ambil pembayaran berdasarkan status"""
        paymentsByStatus(status: String!): [Payment!]!

        """Ambil semua metode pembayaran"""
        paymentMethods: [PaymentMethod!]!

        """Ambil metode pembayaran berdasarkan ID"""
        paymentMethod(id: ID!): PaymentMethod
    }

    type Mutation {
        """Buat pembayaran baru"""
        createPayment(
            order_id: Int!
            user_id: Int!
            payment_method_id: Int
            amount: Float!
            notes: String
        ): Payment!

        """Update status pembayaran"""
        updatePaymentStatus(
            id: ID!
            status: String!
        ): Payment!

        """Buat metode pembayaran baru"""
        createPaymentMethod(
            name: String!
            code: String!
        ): PaymentMethod!

        """Update metode pembayaran"""
        updatePaymentMethod(
            id: ID!
            name: String
            code: String
            is_active: Boolean
        ): PaymentMethod!

        """Hapus metode pembayaran"""
        deletePaymentMethod(id: ID!): Boolean!
    }
`;

module.exports = typeDefs;
