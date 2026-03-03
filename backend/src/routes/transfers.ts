import { Router, Request, Response, NextFunction } from "express";
import { Transfer, Wallet, User, Ledger } from "../models/index";
import sequelize from "../database";
import { transition } from "../helpers/transferStateMachine";
import { TransferStatus } from "../models/Transfer";
import { isDuplicateTransfer } from "../helpers/duplicateDetector";

const router = Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  let transfer: Transfer | null = null;

  try {
    const { from_user_id, to_user_id, amount } = req.body;
    const idempotency_key = req.headers["idempotency-key"] as string;

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

    const existingTransfer = await Transfer.findOne({ where: { idempotency_key } });
    if (existingTransfer) {
      await t.rollback();
      res.status(200).json({ message: "Transferencia ya procesada.", transfer: existingTransfer });
      return;
    }

    const duplicate = await isDuplicateTransfer(from_user_id, to_user_id, parseFloat(String(amount)));
    if (duplicate) {
      await t.rollback();
      res.status(409).json({ message: "Transferencia duplicada detectada. Esperá un momento antes de reintentar." });
      return;
    }

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

    // Crear transferencia en estado "pending"
    transfer = await Transfer.create(
      { from_user_id, to_user_id, amount, idempotency_key },
      { transaction: t }
    );

    // pending → processing
    await transfer.update(
      { status: transition(transfer.status as TransferStatus, "processing" as TransferStatus) },
      { transaction: t }
    );

    await fromWallet.update(
      { balance: parseFloat(String(fromWallet.balance)) - parseFloat(String(amount)) },
      { transaction: t }
    );

    await toWallet.update(
      { balance: parseFloat(String(toWallet.balance)) + parseFloat(String(amount)) },
      { transaction: t }
    );

    await Ledger.create(
      {
        transfer_id: transfer.id,
        wallet_id: fromWallet.id,
        amount: -parseFloat(String(amount)),
      },
      { transaction: t }
    );

    await Ledger.create(
      {
        transfer_id: transfer.id,
        wallet_id: toWallet.id,
        amount: parseFloat(String(amount)),
      },
      { transaction: t }
    );

    // processing → completed
    await transfer.update(
      { status: transition(transfer.status as TransferStatus, "completed" as TransferStatus) },
      { transaction: t }
    );

    await t.commit();
    res.status(201).json({ message: "Transferencia exitosa.", transfer });
  } catch (err) {
    await t.rollback();

    // Si la transferencia fue creada, marcarla como failed
    if (transfer) {
      await transfer.update({ status: transition(transfer.status as TransferStatus, "failed" as TransferStatus) });
    }

    next(err);
  }
});

router.post("/:id/reverse", async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();

  try {
    // Buscar la transferencia original
    const transfer = await Transfer.findByPk(req.params.id as string, { transaction: t });

    if (!transfer) {
      await t.rollback();
      res.status(404).json({ message: "Transferencia no encontrada." });
      return;
    }

    // Validar que se puede revertir
    if (transfer.status !== "completed") {
      await t.rollback();
      res.status(400).json({ message: `No se puede revertir una transferencia en estado "${transfer.status}".` });
      return;
    }

    // Buscar las wallets con lock
    const fromWallet = await Wallet.findOne({
      where: { user_id: transfer.from_user_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    const toWallet = await Wallet.findOne({
      where: { user_id: transfer.to_user_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!fromWallet || !toWallet) {
      await t.rollback();
      res.status(404).json({ message: "Wallet no encontrada." });
      return;
    }

    // Verificar que toWallet tiene saldo suficiente para revertir
    if (parseFloat(String(toWallet.balance)) < parseFloat(String(transfer.amount))) {
      await t.rollback();
      res.status(400).json({ message: "Saldo insuficiente para revertir la transferencia." });
      return;
    }

    // Revertir los balances
    await toWallet.update(
      { balance: parseFloat(String(toWallet.balance)) - parseFloat(String(transfer.amount)) },
      { transaction: t }
    );

    await fromWallet.update(
      { balance: parseFloat(String(fromWallet.balance)) + parseFloat(String(transfer.amount)) },
      { transaction: t }
    );

    // Double-entry ledger para el reverso
    await Ledger.create(
      {
        transfer_id: transfer.id,
        wallet_id: toWallet.id,
        amount: -parseFloat(String(transfer.amount)), // débito al que recibió
      },
      { transaction: t }
    );

    await Ledger.create(
      {
        transfer_id: transfer.id,
        wallet_id: fromWallet.id,
        amount: parseFloat(String(transfer.amount)), // crédito al que envió
      },
      { transaction: t }
    );

    // Transición completed → reversed
    await transfer.update(
      { status: transition(transfer.status as TransferStatus, "reversed" as TransferStatus) },
      { transaction: t }
    );

    await t.commit();
    res.status(200).json({ message: "Transferencia revertida exitosamente.", transfer });
  } catch (err) {
    await t.rollback();
    next(err);
  }
});

export default router;
