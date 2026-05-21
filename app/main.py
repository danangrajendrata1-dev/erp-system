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
from app.models.production_model import (
    ProductionOrder,
    ProductionProgress
)
from app.models.cash_model import CashTransaction
from app.models.employee_model import Employee
from app.models.payroll_model import (
    Attendance,
    Payroll
)

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


@app.get("/")
def root():
    return {
        "message": "ERP Backend Running"
    }