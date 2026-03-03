import User from "./User";
import Wallet from "./Wallet";
import Transfer from "./Transfer";
import Ledger from "./Ledger";

User.hasOne(Wallet, { foreignKey: "user_id", onDelete: "CASCADE" });
Wallet.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Transfer, { foreignKey: "from_user_id", as: "sentTransfers" });
Transfer.belongsTo(User, { foreignKey: "from_user_id", as: "sender" });

User.hasMany(Transfer, { foreignKey: "to_user_id", as: "receivedTransfers" });
Transfer.belongsTo(User, { foreignKey: "to_user_id", as: "receiver" });

Transfer.hasMany(Ledger, { foreignKey: "transfer_id" });
Ledger.belongsTo(Transfer, { foreignKey: "transfer_id" });

Wallet.hasMany(Ledger, { foreignKey: "wallet_id" });
Ledger.belongsTo(Wallet, { foreignKey: "wallet_id" });

export { User, Wallet, Transfer, Ledger };
