from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.cash_model import (
    CashTransaction
)


def create_cash_transaction(
    db: Session,
    data
):

    transaction = CashTransaction(
        transaction_type=data.transaction_type,
        amount=data.amount,
        description=data.description
    )

    db.add(transaction)

    db.commit()

    db.refresh(transaction)

    return transaction


def get_cash_transactions(
    db: Session
):

    return db.query(
        CashTransaction
    ).all()


def get_cash_balance(
    db: Session
):

    cash_in = db.query(
        func.sum(CashTransaction.amount)
    ).filter(
        CashTransaction.transaction_type == "IN"
    ).scalar()

    cash_out = db.query(
        func.sum(CashTransaction.amount)
    ).filter(
        CashTransaction.transaction_type == "OUT"
    ).scalar()

    cash_in = cash_in or 0
    cash_out = cash_out or 0

    balance = cash_in - cash_out

    return {
        "cash_in": cash_in,
        "cash_out": cash_out,
        "balance": balance
    }