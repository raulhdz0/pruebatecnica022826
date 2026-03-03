import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../database'

interface WalletAttributes {
  id: string
  user_id: string
  balance: number
}

interface WalletCreationAttributes extends Optional<WalletAttributes, 'id'> {}

class Wallet extends Model<WalletAttributes, WalletCreationAttributes> implements WalletAttributes {
  public id!: string
  public user_id!: string
  public balance!: number
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Wallet.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    balance: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    }
  },
  {
    sequelize,
    tableName: 'wallets',
    timestamps: true
  }
)

export default Wallet
