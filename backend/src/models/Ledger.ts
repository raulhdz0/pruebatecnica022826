import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../database";

interface LedgerAttributes {
    id: string;
    transfer_id: string;
    wallet_id: string;
    amount: number;
}

interface LedgerCreationAttributes extends Optional<LedgerAttributes, "id"> { }

class Ledger extends Model<LedgerAttributes, LedgerCreationAttributes> implements LedgerAttributes {
    public id!: string;
    public transfer_id!: string;
    public wallet_id!: string;
    public amount!: number;
    public readonly createdAt!: Date;
}

Ledger.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        transfer_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "transfers",
                key: "id",
            },
        },
        wallet_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "wallets",
                key: "id",
            },
        },
        amount: {
            type: DataTypes.DECIMAL(18, 2),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "ledger",
        timestamps: true,
        updatedAt: false,
    }
);

export default Ledger;
