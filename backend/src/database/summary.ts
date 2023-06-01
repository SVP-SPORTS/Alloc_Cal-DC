
import { Model, DataTypes } from "sequelize";
import sequelize from "../sequelize";

class Summary extends Model {
    public storeName!: string;
    public sizeQuantities!: any; 
    public standardQuantity!: number;
    public total! : number;
    public po_no!: string;
   public allocation_id! : number;
   public style_no!: string;
   public description!: string;
   public color!: string;
   public cost!: number;
   public msrp!: number;
   public total_qty!: number;
   public receivedQuantities!: {size: string, quantity: number}[];  
  
}

Summary.init({
    allocation_id: {
        type: DataTypes.INTEGER,
       
       
      },
      
      storeName: {
        type: DataTypes.STRING,
       
      },
      sizeQuantities: {
        type: DataTypes.JSONB,
       
      },
     
      total: { 
        type: DataTypes.INTEGER,
      
      },
      po_no: {  
        type: DataTypes.STRING,
      
      },
      supplier_name: { 
        type: DataTypes.STRING,
        
       
      },
      style_no: {
        type: new DataTypes.STRING(255),
        
        
      },
      description: {
        type: new DataTypes.TEXT,
        
      },
      color: {
        type: new DataTypes.STRING(255),
        
      }, 
      cost: {
        type: DataTypes.DECIMAL(10, 2),
        
      },
      msrp: {  
        type: DataTypes.DECIMAL(10, 2), 
        
      },
        
  receivedQuantities: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    
  },
  totalqty: {
    type: DataTypes.INTEGER,
  },
}, {
  sequelize,
  modelName: 'summary',
  timestamps: true,
});

export default Summary;
 