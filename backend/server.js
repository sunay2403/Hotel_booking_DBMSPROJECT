// ============================================
// BACKEND API - Node.js + Express + Oracle DB
// ============================================

// Install required packages:
// npm install express oracledb cors body-parser dotenv

const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Oracle DB Configuration
const dbConfig = {
    user: process.env.DB_USER || 'your_username',
    password: process.env.DB_PASSWORD || 'your_password',
    connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/XEPDB1'
};

// Initialize Oracle Client (for thick mode if needed)
// oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient_21_3' });

// ============================================
// DATABASE CONNECTION POOL
// ============================================
let pool;

async function initializePool() {
    try {
        pool = await oracledb.createPool({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString,
            poolMin: 2,
            poolMax: 10,
            poolIncrement: 1
        });
        console.log('✅ Oracle connection pool created');
    } catch (err) {
        console.error('❌ Error creating pool:', err);
        process.exit(1);
    }
}

// ============================================
// API ENDPOINTS
// ============================================

// 1. Get Available Rooms
app.get('/api/rooms/available', async (req, res) => {
    let connection;
    try {
        const { minCapacity, category, checkin, checkout } = req.query;
        
        connection = await pool.getConnection();
        
        let query = `
            SELECT room_number, category, price, capacity, status
            FROM Room
            WHERE status = 'available'
            AND capacity >= :minCapacity
        `;
        
        const binds = { minCapacity: minCapacity || 1 };
        
        if (category) {
            query += ` AND category = :category`;
            binds.category = category;
        }
        
        query += ` ORDER BY price`;
        
        const result = await connection.execute(query, binds);
        
        res.json({
            success: true,
            rooms: result.rows.map(row => ({
                roomNumber: row[0],
                category: row[1],
                price: row[2],
                capacity: row[3],
                status: row[4]
            }))
        });
        
    } catch (err) {
        console.error('Error fetching rooms:', err);
        res.status(500).json({ success: false, error: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
});

// 2. Create Customer and Booking (Complete Flow)
app.post('/api/bookings/create', async (req, res) => {
    let connection;
    try {
        const {
            customerName,
            email,
            mobile,
            aadhar,
            dob,
            street,
            city,
            state,
            country,
            roomNumber,
            checkinDate,
            checkoutDate
        } = req.body;
        
        connection = await pool.getConnection();
        
        // Start transaction
        await connection.execute('BEGIN NULL; END;');
        
        // 1. Check if customer exists
        let customerResult = await connection.execute(
            `SELECT c_id FROM Customer WHERE email = :email OR aadhar_no = :aadhar`,
            { email, aadhar }
        );
        
        let customerId;
        
        if (customerResult.rows.length > 0) {
            customerId = customerResult.rows[0][0];
        } else {
            // 2. Create new customer
            const customerInsert = await connection.execute(
                `INSERT INTO Customer (c_id, name, dob, email, street, city, state, country, aadhar_no)
                 VALUES (customer_seq.NEXTVAL, :name, TO_DATE(:dob, 'YYYY-MM-DD'), :email, :street, :city, :state, :country, :aadhar)
                 RETURNING c_id INTO :id`,
                {
                    name: customerName,
                    dob: dob || '1990-01-01',
                    email,
                    street,
                    city,
                    state,
                    country,
                    aadhar,
                    id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
                }
            );
            
            customerId = customerInsert.outBinds.id[0];
            
            // 3. Add phone number
            await connection.execute(
                `INSERT INTO Customer_Phone (c_id, mobile_number) VALUES (:customerId, :mobile)`,
                { customerId, mobile }
            );
        }
        
        // 4. Create booking
        const bookingInsert = await connection.execute(
            `INSERT INTO Booking (b_id, b_date, checkin_date, checkout_date, total_bookings, c_id, room_number)
             VALUES (booking_seq.NEXTVAL, SYSDATE, TO_DATE(:checkin, 'YYYY-MM-DD'), TO_DATE(:checkout, 'YYYY-MM-DD'), 1, :customerId, :roomNumber)
             RETURNING b_id INTO :bookingId`,
            {
                checkin: checkinDate,
                checkout: checkoutDate,
                customerId,
                roomNumber,
                bookingId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            }
        );
        
        const bookingId = bookingInsert.outBinds.bookingId[0];
        
        // 5. Insert into Books relationship
        await connection.execute(
            `INSERT INTO Books (aadhar_no, name, c_id, b_id) VALUES (:aadhar, :name, :customerId, :bookingId)`,
            { aadhar, name: customerName, customerId, bookingId }
        );
        
        // 6. Insert into Has relationship
        await connection.execute(
            `INSERT INTO Has (b_id, room_number) VALUES (:bookingId, :roomNumber)`,
            { bookingId, roomNumber }
        );
        
        // 7. Update room status
        await connection.execute(
            `UPDATE Room SET status = 'occupied' WHERE room_number = :roomNumber`,
            { roomNumber }
        );
        
        // 8. Calculate total amount
        const amountResult = await connection.execute(
            `SELECT calculate_booking_amount(:bookingId) FROM DUAL`,
            { bookingId }
        );
        
        const totalAmount = amountResult.rows[0][0];
        
        // Commit transaction
        await connection.commit();
        
        res.json({
            success: true,
            bookingId,
            customerId,
            totalAmount,
            message: 'Booking created successfully'
        });
        
    } catch (err) {
        console.error('Error creating booking:', err);
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackErr) {
                console.error('Error rolling back:', rollbackErr);
            }
        }
        res.status(500).json({ success: false, error: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
});

// 3. Process Payment
app.post('/api/payments/process', async (req, res) => {
    let connection;
    try {
        const { bookingId, amount, paymentMode } = req.body;
        
        connection = await pool.getConnection();
        
        // Create payment
        const paymentInsert = await connection.execute(
            `INSERT INTO Payment (p_id, payment_date, amount, payment_mode, b_id)
             VALUES (payment_seq.NEXTVAL, SYSDATE, :amount, :paymentMode, :bookingId)
             RETURNING p_id INTO :paymentId`,
            {
                amount,
                paymentMode,
                bookingId,
                paymentId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            }
        );
        
        const paymentId = paymentInsert.outBinds.paymentId[0];
        
        // Insert into Paid relationship
        await connection.execute(
            `INSERT INTO Paid (p_id, b_id) VALUES (:paymentId, :bookingId)`,
            { paymentId, bookingId }
        );
        
        await connection.commit();
        
        res.json({
            success: true,
            paymentId,
            message: 'Payment processed successfully'
        });
        
    } catch (err) {
        console.error('Error processing payment:', err);
        if (connection) {
            await connection.rollback();
        }
        res.status(500).json({ success: false, error: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
});

// 4. Get Booking Details
app.get('/api/bookings/:bookingId', async (req, res) => {
    let connection;
    try {
        const { bookingId } = req.params;
        
        connection = await pool.getConnection();
        
        const result = await connection.execute(
            `SELECT b.b_id, b.b_date, b.checkin_date, b.checkout_date, b.room_number,
                    c.name, c.email, c.mobile_number AS phone,
                    r.category, r.price,
                    calculate_booking_amount(b.b_id) AS total_amount
             FROM Booking b
             JOIN Customer c ON b.c_id = c.c_id
             LEFT JOIN Customer_Phone cp ON c.c_id = cp.c_id
             JOIN Room r ON b.room_number = r.room_number
             WHERE b.b_id = :bookingId`,
            { bookingId }
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }
        
        const row = result.rows[0];
        
        res.json({
            success: true,
            booking: {
                bookingId: row[0],
                bookingDate: row[1],
                checkinDate: row[2],
                checkoutDate: row[3],
                roomNumber: row[4],
                customerName: row[5],
                customerEmail: row[6],
                customerPhone: row[7],
                roomCategory: row[8],
                roomPrice: row[9],
                totalAmount: row[10]
            }
        });
        
    } catch (err) {
        console.error('Error fetching booking:', err);
        res.status(500).json({ success: false, error: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
});

// 5. Checkout (Make room available)
app.post('/api/bookings/checkout/:bookingId', async (req, res) => {
    let connection;
    try {
        const { bookingId } = req.params;
        
        connection = await pool.getConnection();
        
        // Get room number
        const roomResult = await connection.execute(
            `SELECT room_number FROM Booking WHERE b_id = :bookingId`,
            { bookingId }
        );
        
        if (roomResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }
        
        const roomNumber = roomResult.rows[0][0];
        
        // Update room status
        await connection.execute(
            `UPDATE Room SET status = 'available' WHERE room_number = :roomNumber`,
            { roomNumber }
        );
        
        await connection.commit();
        
        res.json({
            success: true,
            message: 'Checkout completed successfully'
        });
        
    } catch (err) {
        console.error('Error during checkout:', err);
        if (connection) {
            await connection.rollback();
        }
        res.status(500).json({ success: false, error: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
});

// ============================================
// SERVER STARTUP
// ============================================

async function startup() {
    try {
        await initializePool();
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
        });
    } catch (err) {
        console.error('Error during startup:', err);
        process.exit(1);
    }
}

startup();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    try {
        await pool.close(10);
        console.log('✅ Connection pool closed');
        process.exit(0);
    } catch (err) {
        console.error('Error closing pool:', err);
        process.exit(1);
    }
});