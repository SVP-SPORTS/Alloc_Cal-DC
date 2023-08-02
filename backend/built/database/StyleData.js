import { Model, DataTypes } from "sequelize";
import sequelize from "../sequelize";
import Supplier from "./SupplierData";
class Style extends Model {
    style_id;
    supplier_id;
    style_no;
    description;
    color;
    cost;
    msrp;
    total_qty;
    location;
    first_name;
}
Style.init({
    supplier_name: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Supplier,
            key: "supplier_name",
        },
        onUpdate: "CASECADE"
    },
    style_no: {
        type: new DataTypes.STRING(255),
        allowNull: false,
        primaryKey: true,
    },
    description: {
        type: new DataTypes.TEXT,
        allowNull: false,
    },
    color: {
        type: new DataTypes.STRING(255),
        allowNull: false,
    },
    cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    msrp: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: "styles",
    sequelize, // passing the `sequelize` instance is required
});
export default Style;
