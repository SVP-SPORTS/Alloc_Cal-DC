import Supplier from './database/supplier';
import Style from './database/style';
import Data from './database/trial'; 
Supplier.hasMany(Style, {
  foreignKey: 'supplier_name',
  as: 'styles',
});

Style.belongsTo(Supplier, {
  foreignKey: 'supplier_name',
  as: 'supplier',
});


Supplier.hasMany(Data, { foreignKey: 'supplier_name', as: 'data' }); 
Style.hasMany(Data, { foreignKey: 'style_no', as: 'data' }); 
Data.belongsTo(Supplier, { foreignKey: 'supplier_name', as: 'supplier' }); 
//Data.belongsTo(Style, { foreignKey: 'style_no', as: 'styles' }); 
 