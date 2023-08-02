import express from 'express';
import PurchaseOrder from '../database/PurchaseOrderData';
import Supplier from '../database/SupplierData';
import sequelize from '../sequelize';
const router = express.Router();
router.post('/', async (req, res) => {
    const { poNo, supplierName } = req.body;
    // Validate if the supplier exists
    const supplierData = await Supplier.findOne({ where: { supplier_name: supplierName } });
    if (!supplierData) {
        return res.status(400).json({ error: 'Supplier not found' });
    }
    //const transaction = await sequelize.transaction();
    try {
        const transaction = await sequelize.transaction();
        let poData = await PurchaseOrder.findOne({ where: { po_no: poNo } });
        if (poData) {
            res.status(200).json(poData);
        }
        else {
            const newPoData = await PurchaseOrder.create({
                po_no: poNo,
                supplier_name: supplierName
            }, { transaction });
            await transaction.commit();
            res.status(200).json(newPoData);
        }
    }
    catch (error) {
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});
export default router;
