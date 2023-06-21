import { Model, DataTypes, UUIDV4 } from 'sequelize';
import sequelize from '../sequelize';
import { AllowNull } from 'sequelize-typescript';

class Store extends Model {
  public store_id!: string;  // UUIDv4
  public storeName!: string;
  public style_number!: string;
  public supplierName!: string;
  public poNo!: string;
  public sizeQuantities!: any[];
  public total!: number;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Store.init({
  store_id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    
  },
  storeName: {
    type: DataTypes.JSONB,
    primaryKey: true,
    allowNull: false  
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
  sequelize, // passing the `sequelize` instance is required
  tableName: "stores", // replace with your custom table name
});

export default Store;
