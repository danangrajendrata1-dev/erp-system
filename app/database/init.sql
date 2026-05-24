CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,

    customer_name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(100),
    npwp VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_orders (
    id SERIAL PRIMARY KEY,

    order_date DATE,
    order_number VARCHAR(100) NOT NULL,
    po_date DATE,
    material_po_number VARCHAR(100),
    delivery_date DATE,

    customer_id INTEGER REFERENCES customers(id),
    customer_name VARCHAR(255),

    size VARCHAR(100),
    material_type VARCHAR(255),
    print_type VARCHAR(255),
    specification TEXT,

    unit VARCHAR(50),
    quantity NUMERIC(18,2) DEFAULT 0,
    rim NUMERIC(18,2) DEFAULT 0,
    price NUMERIC(18,2) DEFAULT 0,

    total_quantity NUMERIC(18,2) DEFAULT 0,
    partial_billing_quantity NUMERIC(18,2) DEFAULT 0,

    status VARCHAR(50) DEFAULT 'PO_MASUK',

    note TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS material_receipts (
    id SERIAL PRIMARY KEY,

    production_order_id INTEGER NOT NULL REFERENCES production_orders(id) ON DELETE CASCADE,

    receipt_date DATE,
    supplier_name VARCHAR(255),
    material_name VARCHAR(255),
    quantity NUMERIC(18,2) DEFAULT 0,
    unit VARCHAR(50),

    note TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_processes (
    id SERIAL PRIMARY KEY,

    production_order_id INTEGER NOT NULL REFERENCES production_orders(id) ON DELETE CASCADE,

    process_type VARCHAR(50) NOT NULL,
    start_date DATE,
    finish_date DATE,

    operator_name VARCHAR(255),
    machine_name VARCHAR(255),

    input_quantity NUMERIC(18,2) DEFAULT 0,
    output_quantity NUMERIC(18,2) DEFAULT 0,
    reject_quantity NUMERIC(18,2) DEFAULT 0,

    note TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shipments (
    id SERIAL PRIMARY KEY,

    production_order_id INTEGER NOT NULL REFERENCES production_orders(id) ON DELETE CASCADE,

    delivery_note_number VARCHAR(100),
    shipment_date DATE,
    customer_name VARCHAR(255),
    delivery_address TEXT,

    driver_name VARCHAR(255),
    expedition_name VARCHAR(255),

    shipped_quantity NUMERIC(18,2) DEFAULT 0,
    unit VARCHAR(50),

    proof_file_url TEXT,
    note TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,

    production_order_id INTEGER NOT NULL REFERENCES production_orders(id) ON DELETE CASCADE,

    invoice_number VARCHAR(100) NOT NULL,
    invoice_date DATE,

    customer_id INTEGER REFERENCES customers(id),
    customer_name VARCHAR(255),

    subtotal NUMERIC(18,2) DEFAULT 0,
    ppn_percent NUMERIC(5,2) DEFAULT 11,
    ppn_amount NUMERIC(18,2) DEFAULT 0,
    grand_total NUMERIC(18,2) DEFAULT 0,

    payment_status VARCHAR(50) DEFAULT 'UNPAID',

    note TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_production_orders_order_number 
ON production_orders(order_number);

CREATE INDEX IF NOT EXISTS idx_production_orders_customer_name 
ON production_orders(customer_name);

CREATE INDEX IF NOT EXISTS idx_production_orders_status 
ON production_orders(status);

CREATE INDEX IF NOT EXISTS idx_shipments_production_order_id 
ON shipments(production_order_id);

CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number 
ON invoices(invoice_number);

ALTER TABLE production_orders
DROP CONSTRAINT IF EXISTS production_orders_status_check;

ALTER TABLE production_orders
ADD CONSTRAINT production_orders_status_check
CHECK (
    status IN (
        'PO_MASUK',
        'BAHAN_DATANG',
        'POTONG_CETAK',
        'FINISHING',
        'DIKIRIM',
        'INVOICE_TERBIT',
        'SELESAI',
        'CANCELLED'
    )
);

ALTER TABLE production_processes
DROP CONSTRAINT IF EXISTS production_processes_type_check;

ALTER TABLE production_processes
ADD CONSTRAINT production_processes_type_check
CHECK (
    process_type IN (
        'POTONG',
        'CETAK',
        'FINISHING'
    )
);

ALTER TABLE invoices
DROP CONSTRAINT IF EXISTS invoices_payment_status_check;

ALTER TABLE invoices
ADD CONSTRAINT invoices_payment_status_check
CHECK (
    payment_status IN (
        'UNPAID',
        'PARTIAL',
        'PAID',
        'CANCELLED'
    )
);