from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.customer_model import (
    Customer
)

from app.models.supplier_model import (
    Supplier
)

from app.models.material_model import (
    Material
)

from app.models.sales_order_model import (
    SalesOrder
)

from app.models.bkorder_model import (
    BKOrder
)

from app.models.cash_model import (
    CashTransaction
)

from app.models.payroll_model import (
    Payroll
)


def get_dashboard_summary(
    db: Session
):

    total_customers = db.query(
        Customer
    ).count()

    total_suppliers = db.query(
        Supplier
    ).count()

    total_materials = db.query(
        Material
    ).count()

    total_stock = db.query(
        func.sum(Material.stock)
    ).scalar() or 0

    total_orders = db.query(
        SalesOrder
    ).count()

    total_production = db.query(
        BKOrder
    ).count()

    cash_in = db.query(
        func.sum(CashTransaction.amount)
    ).filter(
        CashTransaction.transaction_type == "IN"
    ).scalar() or 0

    cash_out = db.query(
        func.sum(CashTransaction.amount)
    ).filter(
        CashTransaction.transaction_type == "OUT"
    ).scalar() or 0

    balance = cash_in - cash_out

    total_payroll = db.query(
        func.sum(Payroll.final_salary)
    ).scalar() or 0

    return {

        "customers": total_customers,

        "suppliers": total_suppliers,

        "materials": total_materials,

        "total_stock": total_stock,

        "sales_orders": total_orders,

        "production_orders": total_production,

        "cash_in": cash_in,

        "cash_out": cash_out,

        "cash_balance": balance,

        "total_payroll": total_payroll
    }
