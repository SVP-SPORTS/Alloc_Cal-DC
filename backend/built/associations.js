import Supplier from './database/SupplierData';
import Style from './database/StyleData';
import Allocation from './database/AllocationData';
Supplier.hasMany(Style, {
    foreignKey: 'supplier_name',
    as: 'styles',
});
Style.belongsTo(Supplier, {
    foreignKey: 'supplier_name',
    as: 'supplier',
});
Style.hasMany(Allocation, { foreignKey: 'style_no', as: 'styles' });
Supplier.hasMany(Allocation, { foreignKey: 'supplier_name', as: 'suppliers' });
//PurchaseOrder.hasMany(Allocation, {foreignKey: 'po_no', as: 'purchaseOrders'})
//Data.belongsTo(Style, { foreignKey: 'style_no', as: 'styles' }); 
