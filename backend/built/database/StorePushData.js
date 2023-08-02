import { Model, DataTypes, UUIDV4 } from 'sequelize';
import sequelize from '../sequelize';
class Store extends Model {
    store_id; // UUIDv4
    storeName;
    style_number;
    supplierName;
    poNo;
    sizeQuantities;
    total;
    entryId;
    // timestamps!
    createdAt;
    updatedAt;
}
Store.init({
    store_id: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
    },
    storeName: {
        type: DataTypes.JSONB,
        allowNull: false,
        primaryKey: true,
    },
    style_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    supplierName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    poNo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sizeQuantities: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    total: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
}, {
    sequelize,
    tableName: "stores", // replace with your custom table name
});
export default Store;
