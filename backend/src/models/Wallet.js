const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Wallet = sequelize.define("Wallet", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "users",
            key: "id",
        },
    },
    balance: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: 0,
        },
    },
}, {
    tableName: "wallets",
    timestamps: true,
});

module.exports = Wallet;
