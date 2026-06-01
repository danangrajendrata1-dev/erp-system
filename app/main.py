from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import engine, Base

# =========================
# IMPORT MODELS
# =========================
from app.models.user_model import User
from app.models.customer_model import Customer
from app.models.supplier_model import Supplier
from app.models.material_model import Material
from app.models.inventory_model import InventoryMovement
from app.models.sales_order_model import SalesOrder, SalesOrderItem
from app.models.bkorder_model import BKOrder
from app.models.cash_model import CashTransaction
from app.models.employee_model import Employee
from app.models.payroll_model import Attendance, Payroll
from app.models.material_receipt_model import MaterialReceipt
from app.models.production_process_model import ProductionProcess
from app.models.shipment_model import Shipment
from app.models.invoice_model import Invoice
from app.models.sales_103_model import Sales103
from app.models.bkpt_receivables_model import BKPtReceivable
from app.models.bank_103_model import Bank103
from app.models.invoice_103_metadata_model import Invoice103Metadata
from app.api.routes.material_type_route import router as material_type_router
# =========================
# IMPORT ROUTES
# =========================
from app.api.routes.auth_route import router as auth_router
from app.api.routes.customer_route import router as customer_router
from app.api.routes.supplier_route import router as supplier_router
from app.api.routes.material_route import router as material_router
from app.api.routes.inventory_route import router as inventory_router
from app.api.routes.sales_order_route import router as sales_order_router
from app.api.routes.bkorder_route import router as bkorder_router
from app.api.routes.cash_route import router as cash_router
from app.api.routes.payroll_route import router as payroll_router
from app.api.routes.dashboard_route import router as dashboard_router
from app.api.routes.material_receipt_route import router as material_receipt_router
from app.api.routes.production_process_route import router as production_process_router
from app.api.routes.shipment_route import router as shipment_router
from app.api.routes.invoice_route import router as invoice_router
from app.api.routes.sales_103_route import router as sales_103_router
from app.api.routes.bkpt_receivables_route import router as bkpt_receivables_router
from app.api.routes.bank_103_route import router as bank_103_router
from app.api.routes.invoice_103_metadata_route import router as invoice_103_metadata_router


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ERP SYSTEM",
    version="1.0.0"
)

# =========================
# CORS
# =========================
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "https://erp-system-ten-jade.vercel.app",
    "https://erp-system-production-7804.up.railway.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "ERP Backend Running"
    }


# =========================
# INCLUDE ROUTERS
# =========================
app.include_router(auth_router)
app.include_router(customer_router)
app.include_router(supplier_router)
app.include_router(material_router)
app.include_router(inventory_router)
app.include_router(sales_order_router)
# Endpoint utama baru untuk BKOrder.
app.include_router(bkorder_router, prefix="/bkorders")

# Endpoint lama dipertahankan agar integrasi yang masih memakai /production-orders tetap jalan.
app.include_router(bkorder_router, prefix="/production-orders")
app.include_router(cash_router)
app.include_router(payroll_router)
app.include_router(dashboard_router)
app.include_router(material_receipt_router)
app.include_router(production_process_router)
app.include_router(shipment_router)
app.include_router(invoice_router)
app.include_router(sales_103_router)
app.include_router(bkpt_receivables_router)
app.include_router(bank_103_router)
app.include_router(invoice_103_metadata_router)
app.include_router(material_type_router)
