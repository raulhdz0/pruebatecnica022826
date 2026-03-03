import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../database'

interface TransferAttributes {
  id: string
  idempotency_key: string
  from_user_id: string
  to_user_id: string
  amount: number
}

interface TransferCreationAttributes extends Optional<TransferAttributes, 'id'> {}

class Transfer extends Model<TransferAttributes, TransferCreationAttributes> implements TransferAttributes {
  public id!: string
  public idempotency_key!: string
  public from_user_id!: string
  public to_user_id!: string
  public amount!: number
  public readonly createdAt!: Date
}

Transfer.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    idempotency_key: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    from_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    to_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    }
  },
  {
    sequelize,
    tableName: 'transfers',
    timestamps: true,
    updatedAt: false
  }
)

export default Transfer
