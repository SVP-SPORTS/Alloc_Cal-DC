import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize'; 


interface SupplierAttributes {
  supplier_id: number;
  supplier_name: string;
}

interface SupplierCreationAttributes extends Optional<SupplierAttributes, 'supplier_id'> {}

class Supplier extends Model<SupplierAttributes, SupplierCreationAttributes> implements SupplierAttributes {
  public supplier_id!: number;
  public supplier_name!: string;
}


Supplier.init(
  {
    supplier_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
     
    },
    supplier_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    
  },
  
  {
    tableName: 'suppliers',
    sequelize, 
    
  }
);



export default Supplier;
