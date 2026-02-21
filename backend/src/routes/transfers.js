const express = require("express");
const router = express.Router();
const { Transfer, Wallet, User } = require("../models/index");
const sequelize = require("../database");

router.post("/", async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { from_user_id, to_user_id, amount, idempotency_key } = req.body;

    // Validaciones básicas.
    if (!from_user_id || !to_user_id || !amount || !idempotency_key) {
      await t.rollback();
      return res.status(400).json({ message: "Todos los campos son requeridos." });
    }

    if (from_user_id === to_user_id) {
      await t.rollback();
      return res.status(400).json({ message: "El usuario origen y destino no pueden ser el mismo." });
    }

    if (amount <= 0) {
      await t.rollback();
      return res.status(400).json({ message: "El monto debe ser mayor a cero." });
    }

    // Idempotencia.
    const existingTransfer = await Transfer.findOne({ where: { idempotency_key } });
    if (existingTransfer) {
      await t.rollback();
      return res.status(200).json({ message: "Transferencia ya procesada.", transfer: existingTransfer });
    }

    // Verificar que ambos usuarios existen.
    const fromUser = await User.findByPk(from_user_id);
    const toUser = await User.findByPk(to_user_id);

    if (!fromUser) {
      await t.rollback();
      return res.status(404).json({ message: "Usuario origen no encontrado." });
    }

    if (!toUser) {
      await t.rollback();
      return res.status(404).json({ message: "Usuario destino no encontrado." });
    }

    // Verificar saldo suficiente.
    const fromWallet = await Wallet.findOne({ where: { user_id: from_user_id }, transaction: t });
    const toWallet = await Wallet.findOne({ where: { user_id: to_user_id }, transaction: t });

    if (parseFloat(fromWallet.balance) < parseFloat(amount)) {
      await t.rollback();
      return res.status(400).json({ message: "Saldo insuficiente." });
    }

    // Ejecutar transferencia.
    await fromWallet.update(
      { balance: parseFloat(fromWallet.balance) - parseFloat(amount) },
      { transaction: t }
    );

    await toWallet.update(
      { balance: parseFloat(toWallet.balance) + parseFloat(amount) },
      { transaction: t }
    );

    const transfer = await Transfer.create(
      { from_user_id, to_user_id, amount, idempotency_key },
      { transaction: t }
    );

    await t.commit();
    res.status(201).json({ message: "Transferencia exitosa.", transfer });
  } catch (err) {
    await t.rollback();
    next(err);
  }
});

module.exports = router;
