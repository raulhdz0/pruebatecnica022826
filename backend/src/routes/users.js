const express = require("express");
const router = express.Router();
const { User, Wallet } = require("../models/index");

router.get("/", async (req, res, next) => {
    try {
        const users = await User.findAll({
            include: [{ model: Wallet }],
        });
        res.json(users);
    } catch (err) {
        next(err);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const { name, email, balance } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: "Nombre y email son requeridos." });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "El email ya está registrado." });
        }

        const user = await User.create({ name, email });
        const wallet = await Wallet.create({
            user_id: user.id,
            balance: balance || 0.00,
        });

        res.status(201).json({ user, wallet });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
