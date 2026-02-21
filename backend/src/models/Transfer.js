const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Transfer = sequelize.define("Transfer", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    idempotency_key: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    from_user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "users",
            key: "id",
        },
    },
    to_user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "users",
            key: "id",
        },
    },
    amount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        validate: {
            min: 0.01,
        },
    },
}, {
    tableName: "transfers",
    timestamps: true,
    updatedAt: false,
})

module.exports = Transfer;
