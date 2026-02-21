const User = require("./User");
const Wallet = require("./Wallet");
const Transfer = require("./Transfer");

User.hasOne(Wallet, { foreignKey: "user_id", onDelete: "CASCADE" });
Wallet.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Transfer, { foreignKey: "from_user_id", as: "sentTransfers" });
Transfer.belongsTo(User, { foreignKey: "from_user_id", as: "sender" });

User.hasMany(Transfer, { foreignKey: "to_user_id", as: "receivedTransfers" });
Transfer.belongsTo(User, { foreignKey: "to_user_id", as: "receiver" });

module.exports = {
    User,
    Wallet,
    Transfer
};
