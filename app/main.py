from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import (
    engine,
    Base
)

# =========================
# IMPORT MODELS
# =========================
from app.models.user_model import User
from app.models.customer_model import Customer
from app.models.supplier_model import Supplier
from app.models.material_model import Material
from app.models.inventory_model import InventoryMovement
from app.models.sales_order_model import (
    SalesOrder,
    SalesOrderItem
)
from app.models.production_model import ProductionOrder
from app.models.cash_model import CashTransaction
from app.models.employee_model import Employee
from app.models.payroll_model import (
    Attendance,
    Payroll
)
from app.models.material_receipt_model import MaterialReceipt
from app.models.production_process_model import ProductionProcess
from app.api.routes.production_process_route import router as production_process_router
from app.models.shipment_model import Shipment
from app.api.routes.shipment_route import router as shipment_router
from app.models.invoice_model import Invoice
from app.api.routes.invoice_route import router as invoice_router
from app.models.sales_103_model import Sales103
# =========================
# ROUTES
# =========================
from app.api.routes.auth_route import router as auth_router
from app.api.routes.customer_route import router as customer_router
from app.api.routes.supplier_route import router as supplier_router
from app.api.routes.material_route import router as material_router
from app.api.routes.inventory_route import router as inventory_router
from app.api.routes.sales_order_route import router as sales_order_router
from app.api.routes.production_route import router as production_router
from app.api.routes.cash_route import router as cash_router
from app.api.routes.payroll_route import router as payroll_router
from app.api.routes.dashboard_route import router as dashboard_router
from app.api.routes.material_receipt_route import router as material_receipt_router
from app.api.routes import sales_103_route
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="ERP SYSTEM",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(customer_router)
app.include_router(supplier_router)
app.include_router(material_router)
app.include_router(inventory_router)
app.include_router(sales_order_router)
app.include_router(production_router)
app.include_router(cash_router)
app.include_router(payroll_router)
app.include_router(dashboard_router)
app.include_router(material_receipt_router)
app.include_router(production_process_router)
app.include_router(shipment_router)
app.include_router(invoice_router)
app.include_router(sales_103_route.router)

@app.get("/")
def root():
    return {
        "message": "ERP Backend Running"
    }