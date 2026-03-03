import { Router, Request, Response, NextFunction } from "express";
import { Transfer, Wallet, User, Ledger } from "../models/index";
import sequelize from "../database";

const router = Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();

  try {
    const { from_user_id, to_user_id, amount } = req.body;
    const idempotency_key = req.headers["idempotency-key"] as string;

    // Validaciones básicas
    if (!from_user_id || !to_user_id || !amount || !idempotency_key) {
      await t.rollback();
      res.status(400).json({ message: "Todos los campos son requeridos." });
      return;
    }

    if (from_user_id === to_user_id) {
      await t.rollback();
      res.status(400).json({ message: "El usuario origen y destino no pueden ser el mismo." });
      return;
    }

    if (amount <= 0) {
      await t.rollback();
      res.status(400).json({ message: "El monto debe ser mayor a cero." });
      return;
    }

    // Idempotencia
    const existingTransfer = await Transfer.findOne({ where: { idempotency_key } });
    if (existingTransfer) {
      await t.rollback();
      res.status(200).json({ message: "Transferencia ya procesada.", transfer: existingTransfer });
      return;
    }

    // Verificar que ambos usuarios existen
    const fromUser = await User.findByPk(from_user_id);
    const toUser = await User.findByPk(to_user_id);

    if (!fromUser) {
      await t.rollback();
      res.status(404).json({ message: "Usuario origen no encontrado." });
      return;
    }

    if (!toUser) {
      await t.rollback();
      res.status(404).json({ message: "Usuario destino no encontrado." });
      return;
    }

    // Verificar saldo suficiente con Pessimistic Locking
    const fromWallet = await Wallet.findOne({
      where: { user_id: from_user_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    const toWallet = await Wallet.findOne({
      where: { user_id: to_user_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!fromWallet || !toWallet) {
      await t.rollback();
      res.status(404).json({ message: "Wallet no encontrada." });
      return;
    }

    if (parseFloat(String(fromWallet.balance)) < parseFloat(String(amount))) {
      await t.rollback();
      res.status(400).json({ message: "Saldo insuficiente." });
      return;
    }

    // Ejecutar transferencia
    await fromWallet.update(
      { balance: parseFloat(String(fromWallet.balance)) - parseFloat(String(amount)) },
      { transaction: t }
    );

    await toWallet.update(
      { balance: parseFloat(String(toWallet.balance)) + parseFloat(String(amount)) },
      { transaction: t }
    );

    const transfer = await Transfer.create(
      { from_user_id, to_user_id, amount, idempotency_key },
      { transaction: t }
    );

    // Double-entry ledger
    await Ledger.create(
      {
        transfer_id: transfer.id,
        wallet_id: fromWallet.id,
        amount: -parseFloat(String(amount)), // débito
      },
      { transaction: t }
    );

    await Ledger.create(
      {
        transfer_id: transfer.id,
        wallet_id: toWallet.id,
        amount: parseFloat(String(amount)), // crédito
      },
      { transaction: t }
    );

    await t.commit();
    res.status(201).json({ message: "Transferencia exitosa.", transfer });
  } catch (err) {
    await t.rollback();
    next(err);
  }
});

export default router;
