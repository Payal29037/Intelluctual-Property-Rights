"use strict";
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../index');
class IPAsset extends Model {
}
IPAsset.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Primary key',
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            len: [3, 255],
        },
        comment: 'Title of the IP asset',
    },
    ipType: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Type of IP (e.g., copyright, patent, trademark)',
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            len: [10, 5000],
        },
        comment: 'Description of the IP asset',
    },
    ipfsHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'IPFS hash for asset metadata',
    },
    owner: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'User ID of the owner',
        index: true,
    },
    walletAddress: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Wallet address of the owner',
        index: true,
    },
    blockchainId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'Blockchain asset ID or transaction hash',
        index: true,
    },
}, {
    sequelize,
    modelName: 'IPAsset',
    tableName: 'ip_assets',
    timestamps: true,
    indexes: [
        { fields: ['owner'] },
        { fields: ['walletAddress'] },
        { fields: ['blockchainId'] },
    ],
});
module.exports = { IPAsset };
//# sourceMappingURL=ipAsset.model.js.map