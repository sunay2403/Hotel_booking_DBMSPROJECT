-- ============================================
-- HOTEL BOOKING SYSTEM - PL/SQL IMPLEMENTATION
-- ============================================

-- Drop existing tables (for clean setup)
DROP TABLE Paid CASCADE CONSTRAINTS;
DROP TABLE Payment CASCADE CONSTRAINTS;
DROP TABLE Booking CASCADE CONSTRAINTS;
DROP TABLE Has CASCADE CONSTRAINTS;
DROP TABLE Books CASCADE CONSTRAINTS;
DROP TABLE Room CASCADE CONSTRAINTS;
DROP TABLE Customer_Phone CASCADE CONSTRAINTS;
DROP TABLE Customer CASCADE CONSTRAINTS;

-- ============================================
-- TABLE CREATION
-- ============================================

-- Customer Table (1NF, 2NF, 3NF compliant)
CREATE TABLE Customer (
    c_id NUMBER PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    dob DATE NOT NULL,
    email VARCHAR2(100) UNIQUE NOT NULL,
    street VARCHAR2(200),
    city VARCHAR2(50),
    state VARCHAR2(50),
    country VARCHAR2(50),
    aadhar_no VARCHAR2(12) UNIQUE NOT NULL,
    CONSTRAINT chk_email CHECK (email LIKE '%@%'),
    CONSTRAINT chk_aadhar CHECK (LENGTH(aadhar_no) = 12)
);

-- Customer Phone Table (Separate schema for multi-valued attribute)
CREATE TABLE Customer_Phone (
    c_id NUMBER,
    mobile_number VARCHAR2(10) NOT NULL,
    PRIMARY KEY (c_id, mobile_number),
    FOREIGN KEY (c_id) REFERENCES Customer(c_id) ON DELETE CASCADE,
    CONSTRAINT chk_mobile CHECK (LENGTH(mobile_number) = 10)
);

-- Room Table with Category (ISA relationship implemented)
CREATE TABLE Room (
    room_number VARCHAR2(10) PRIMARY KEY,
    price NUMBER(10,2) NOT NULL,
    capacity NUMBER(1) NOT NULL,
    category VARCHAR2(20) NOT NULL,
    status VARCHAR2(20) DEFAULT 'available',
    CONSTRAINT chk_category CHECK (category IN ('Economy', 'Deluxe', 'Suite', 'Presidential')),
    CONSTRAINT chk_status CHECK (status IN ('available', 'occupied', 'maintenance')),
    CONSTRAINT chk_capacity CHECK (capacity BETWEEN 1 AND 4),
    CONSTRAINT chk_price CHECK (price > 0)
);

-- Booking Table
CREATE TABLE Booking (
    b_id NUMBER PRIMARY KEY,
    b_date DATE DEFAULT SYSDATE NOT NULL,
    checkin_date DATE NOT NULL,
    checkout_date DATE NOT NULL,
    total_bookings NUMBER DEFAULT 1,
    c_id NUMBER NOT NULL,
    room_number VARCHAR2(10) NOT NULL,
    FOREIGN KEY (c_id) REFERENCES Customer(c_id) ON DELETE CASCADE,
    FOREIGN KEY (room_number) REFERENCES Room(room_number),
    CONSTRAINT chk_dates CHECK (checkout_date > checkin_date),
    CONSTRAINT chk_booking_date CHECK (b_date <= checkin_date)
);

-- Payment Table
CREATE TABLE Payment (
    p_id NUMBER PRIMARY KEY,
    payment_date DATE DEFAULT SYSDATE NOT NULL,
    amount NUMBER(10,2) NOT NULL,
    payment_mode VARCHAR2(20) NOT NULL,
    b_id NUMBER NOT NULL,
    FOREIGN KEY (b_id) REFERENCES Booking(b_id) ON DELETE CASCADE,
    CONSTRAINT chk_mode CHECK (payment_mode IN ('Cash', 'Online')),
    CONSTRAINT chk_amount CHECK (amount > 0)
);

-- Books Relationship Table (Customer books Booking)
CREATE TABLE Books (
    aadhar_no VARCHAR2(12),
    name VARCHAR2(100),
    c_id NUMBER,
    b_id NUMBER,
    PRIMARY KEY (c_id, b_id),
    FOREIGN KEY (c_id) REFERENCES Customer(c_id) ON DELETE CASCADE,
    FOREIGN KEY (b_id) REFERENCES Booking(b_id) ON DELETE CASCADE
);

-- Has Relationship Table (Booking has Room)
CREATE TABLE Has (
    b_id NUMBER,
    room_number VARCHAR2(10),
    PRIMARY KEY (b_id, room_number),
    FOREIGN KEY (b_id) REFERENCES Booking(b_id) ON DELETE CASCADE,
    FOREIGN KEY (room_number) REFERENCES Room(room_number)
);

-- Paid Relationship Table (Payment paid for Booking)
CREATE TABLE Paid (
    p_id NUMBER,
    b_id NUMBER,
    PRIMARY KEY (p_id, b_id),
    FOREIGN KEY (p_id) REFERENCES Payment(p_id) ON DELETE CASCADE,
    FOREIGN KEY (b_id) REFERENCES Booking(b_id) ON DELETE CASCADE
);

-- ============================================
-- SEQUENCES FOR AUTO-INCREMENT IDs
-- ============================================

CREATE SEQUENCE customer_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE booking_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE payment_seq START WITH 1 INCREMENT BY 1;

-- ============================================
-- SAMPLE DATA INSERTION
-- ============================================

-- Insert Rooms
INSERT INTO Room VALUES ('101', 1500, 2, 'Economy', 'available');
INSERT INTO Room VALUES ('102', 1500, 2, 'Economy', 'available');
INSERT INTO Room VALUES ('201', 2500, 2, 'Deluxe', 'available');
INSERT INTO Room VALUES ('202', 2500, 2, 'Deluxe', 'available');
INSERT INTO Room VALUES ('301', 4000, 4, 'Suite', 'available');
INSERT INTO Room VALUES ('302', 4000, 4, 'Suite', 'available');
INSERT INTO Room VALUES ('401', 8000, 4, 'Presidential', 'available');

COMMIT;

-- ============================================
-- PL/SQL PROCEDURES AND FUNCTIONS
-- ============================================

-- Procedure: Add New Customer
CREATE OR REPLACE PROCEDURE add_customer (
    p_name IN VARCHAR2,
    p_dob IN DATE,
    p_email IN VARCHAR2,
    p_street IN VARCHAR2,
    p_city IN VARCHAR2,
    p_state IN VARCHAR2,
    p_country IN VARCHAR2,
    p_aadhar IN VARCHAR2,
    p_mobile IN VARCHAR2,
    p_customer_id OUT NUMBER
) AS
BEGIN
    -- Insert customer
    INSERT INTO Customer (c_id, name, dob, email, street, city, state, country, aadhar_no)
    VALUES (customer_seq.NEXTVAL, p_name, p_dob, p_email, p_street, p_city, p_state, p_country, p_aadhar)
    RETURNING c_id INTO p_customer_id;
    
    -- Insert phone number
    INSERT INTO Customer_Phone (c_id, mobile_number)
    VALUES (p_customer_id, p_mobile);
    
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Customer added successfully with ID: ' || p_customer_id);
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        DBMS_OUTPUT.PUT_LINE('Error: Email or Aadhar already exists');
        ROLLBACK;
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
        ROLLBACK;
END;
/

-- Procedure: Create Booking
CREATE OR REPLACE PROCEDURE create_booking (
    p_customer_id IN NUMBER,
    p_room_number IN VARCHAR2,
    p_checkin IN DATE,
    p_checkout IN DATE,
    p_booking_id OUT NUMBER
) AS
    v_room_status VARCHAR2(20);
    v_customer_name VARCHAR2(100);
    v_customer_aadhar VARCHAR2(12);
BEGIN
    -- Check if room is available
    SELECT status INTO v_room_status
    FROM Room
    WHERE room_number = p_room_number;
    
    IF v_room_status != 'available' THEN
        RAISE_APPLICATION_ERROR(-20001, 'Room is not available');
    END IF;
    
    -- Get customer details for Books table
    SELECT name, aadhar_no INTO v_customer_name, v_customer_aadhar
    FROM Customer
    WHERE c_id = p_customer_id;
    
    -- Create booking
    INSERT INTO Booking (b_id, b_date, checkin_date, checkout_date, total_bookings, c_id, room_number)
    VALUES (booking_seq.NEXTVAL, SYSDATE, p_checkin, p_checkout, 1, p_customer_id, p_room_number)
    RETURNING b_id INTO p_booking_id;
    
    -- Insert into Books relationship table
    INSERT INTO Books (aadhar_no, name, c_id, b_id)
    VALUES (v_customer_aadhar, v_customer_name, p_customer_id, p_booking_id);
    
    -- Insert into Has relationship table
    INSERT INTO Has (b_id, room_number)
    VALUES (p_booking_id, p_room_number);
    
    -- Update room status
    UPDATE Room
    SET status = 'occupied'
    WHERE room_number = p_room_number;
    
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Booking created successfully with ID: ' || p_booking_id);
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('Error: Customer or Room not found');
        ROLLBACK;
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
        ROLLBACK;
END;
/

-- Procedure: Process Payment
CREATE OR REPLACE PROCEDURE process_payment (
    p_booking_id IN NUMBER,
    p_amount IN NUMBER,
    p_mode IN VARCHAR2,
    p_payment_id OUT NUMBER
) AS
BEGIN
    -- Create payment record
    INSERT INTO Payment (p_id, payment_date, amount, payment_mode, b_id)
    VALUES (payment_seq.NEXTVAL, SYSDATE, p_amount, p_mode, p_booking_id)
    RETURNING p_id INTO p_payment_id;
    
    -- Insert into Paid relationship table
    INSERT INTO Paid (p_id, b_id)
    VALUES (p_payment_id, p_booking_id);
    
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Payment processed successfully with ID: ' || p_payment_id);
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
        ROLLBACK;
END;
/

-- Function: Calculate Total Booking Amount
CREATE OR REPLACE FUNCTION calculate_booking_amount (
    p_booking_id IN NUMBER
) RETURN NUMBER AS
    v_amount NUMBER;
    v_days NUMBER;
    v_room_price NUMBER;
    v_checkin DATE;
    v_checkout DATE;
    v_room_number VARCHAR2(10);
BEGIN
    -- Get booking details
    SELECT checkin_date, checkout_date, room_number
    INTO v_checkin, v_checkout, v_room_number
    FROM Booking
    WHERE b_id = p_booking_id;
    
    -- Get room price
    SELECT price INTO v_room_price
    FROM Room
    WHERE room_number = v_room_number;
    
    -- Calculate number of days
    v_days := v_checkout - v_checkin;
    
    -- Calculate total amount
    v_amount := v_days * v_room_price;
    
    RETURN v_amount;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN 0;
    WHEN OTHERS THEN
        RETURN -1;
END;
/

-- Function: Check Room Availability
CREATE OR REPLACE FUNCTION is_room_available (
    p_room_number IN VARCHAR2,
    p_checkin IN DATE,
    p_checkout IN DATE
) RETURN VARCHAR2 AS
    v_count NUMBER;
    v_status VARCHAR2(20);
BEGIN
    -- Check room status
    SELECT status INTO v_status
    FROM Room
    WHERE room_number = p_room_number;
    
    IF v_status != 'available' THEN
        RETURN 'NO';
    END IF;
    
    -- Check if room has conflicting bookings
    SELECT COUNT(*)
    INTO v_count
    FROM Booking
    WHERE room_number = p_room_number
    AND (
        (checkin_date <= p_checkin AND checkout_date > p_checkin)
        OR (checkin_date < p_checkout AND checkout_date >= p_checkout)
        OR (checkin_date >= p_checkin AND checkout_date <= p_checkout)
    );
    
    IF v_count > 0 THEN
        RETURN 'NO';
    ELSE
        RETURN 'YES';
    END IF;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN 'NO';
    WHEN OTHERS THEN
        RETURN 'ERROR';
END;
/

-- Procedure: Checkout and Make Room Available
CREATE OR REPLACE PROCEDURE checkout_booking (
    p_booking_id IN NUMBER
) AS
    v_room_number VARCHAR2(10);
BEGIN
    -- Get room number from booking
    SELECT room_number INTO v_room_number
    FROM Booking
    WHERE b_id = p_booking_id;
    
    -- Update room status to available
    UPDATE Room
    SET status = 'available'
    WHERE room_number = v_room_number;
    
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Checkout completed for booking ID: ' || p_booking_id);
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('Error: Booking not found');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
        ROLLBACK;
END;
/

-- Procedure: Get Available Rooms by Category and Capacity
CREATE OR REPLACE PROCEDURE get_available_rooms (
    p_min_capacity IN NUMBER,
    p_category IN VARCHAR2 DEFAULT NULL
) AS
    CURSOR room_cursor IS
        SELECT room_number, category, price, capacity, status
        FROM Room
        WHERE capacity >= p_min_capacity
        AND status = 'available'
        AND (p_category IS NULL OR category = p_category)
        ORDER BY price;
BEGIN
    DBMS_OUTPUT.PUT_LINE('Available Rooms:');
    DBMS_OUTPUT.PUT_LINE('-----------------------------------');
    
    FOR room_rec IN room_cursor LOOP
        DBMS_OUTPUT.PUT_LINE('Room: ' || room_rec.room_number || 
                           ' | Category: ' || room_rec.category ||
                           ' | Price: ' || room_rec.price ||
                           ' | Capacity: ' || room_rec.capacity);
    END LOOP;
END;
/

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Validate booking dates
CREATE OR REPLACE TRIGGER trg_validate_booking
BEFORE INSERT OR UPDATE ON Booking
FOR EACH ROW
BEGIN
    IF :NEW.checkin_date < TRUNC(SYSDATE) THEN
        RAISE_APPLICATION_ERROR(-20002, 'Check-in date cannot be in the past');
    END IF;
    
    IF :NEW.checkout_date <= :NEW.checkin_date THEN
        RAISE_APPLICATION_ERROR(-20003, 'Check-out date must be after check-in date');
    END IF;
END;
/

-- Trigger: Auto-update room status on booking deletion
CREATE OR REPLACE TRIGGER trg_booking_delete
AFTER DELETE ON Booking
FOR EACH ROW
BEGIN
    UPDATE Room
    SET status = 'available'
    WHERE room_number = :OLD.room_number;
END;
/

-- ============================================
-- SAMPLE USAGE EXAMPLES
-- ============================================

-- Example 1: Add a new customer and create booking
DECLARE
    v_customer_id NUMBER;
    v_booking_id NUMBER;
    v_payment_id NUMBER;
    v_total_amount NUMBER;
BEGIN
    -- Add customer
    add_customer(
        p_name => 'John Doe',
        p_dob => TO_DATE('1990-05-15', 'YYYY-MM-DD'),
        p_email => 'john.doe@example.com',
        p_street => '123 Main Street',
        p_city => 'Mumbai',
        p_state => 'Maharashtra',
        p_country => 'India',
        p_aadhar => '123456789012',
        p_mobile => '9876543210',
        p_customer_id => v_customer_id
    );
    
    -- Create booking
    create_booking(
        p_customer_id => v_customer_id,
        p_room_number => '301',
        p_checkin => SYSDATE + 5,
        p_checkout => SYSDATE + 8,
        p_booking_id => v_booking_id
    );
    
    -- Calculate total amount
    v_total_amount := calculate_booking_amount(v_booking_id);
    DBMS_OUTPUT.PUT_LINE('Total Amount: ' || v_total_amount);
    
    -- Process payment
    process_payment(
        p_booking_id => v_booking_id,
        p_amount => v_total_amount,
        p_mode => 'Online',
        p_payment_id => v_payment_id
    );
END;
/

-- Example 2: Check room availability
BEGIN
    DBMS_OUTPUT.PUT_LINE('Room 201 available: ' || 
        is_room_available('201', SYSDATE + 2, SYSDATE + 5));
END;
/

-- Example 3: Get available rooms
BEGIN
    get_available_rooms(p_min_capacity => 2, p_category => 'Deluxe');
END;
/