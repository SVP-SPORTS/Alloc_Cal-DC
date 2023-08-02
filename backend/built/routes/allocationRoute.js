import express from 'express';
import Allocation from '../database/AllocationData'; // Update with the path to your allocation model file
import sequelize from '../sequelize';
import { isAuthenticated, checkScope } from '../Auth/authMiddleware';
import PurchaseOrder from '../database/PurchaseOrderData';
import Supplier from '../database/SupplierData';
import Style from '../database/StyleData';
import SKUCounter from '../database/SKU';
const router = express.Router();
// Add this function to generate SKU numbers
async function generateSkus(receivedQty, transaction) {
    let skuCounter = await SKUCounter.findOne({ order: [['counter', 'ASC']], transaction });
    if (!skuCounter) {
        skuCounter = await SKUCounter.create({ counter: 12345678 }, { transaction });
    }
    const skus = receivedQty.map((receivedQty) => {
        return (skuCounter.counter--).toString();
    });
    await skuCounter.save({ transaction });
    return skus;
}
//GENERATE poNo
async function generatePoNo(transaction) {
    const latestPo = await PurchaseOrder.findOne({
        order: [
            [sequelize.fn("right", sequelize.col("po_no"), 5), "DESC"],
        ],
        transaction
    });
    let poNo = "SVP00001";
    if (latestPo) {
        const latestPoNo = parseInt(latestPo.po_no.substring(3));
        const newPoNo = latestPoNo + 1;
        poNo = "SVP" + newPoNo.toString().padStart(5, '0');
    }
    return poNo;
}
router.post('/create', isAuthenticated, checkScope('Admin'), async (req, res, next) => {
    const { supplier_name, styleNo, description, color, cost, msrp, storeName, sizeQuantities, receivedQty, total, totalAllocationPerSize, overstockPerSize, initial } = req.body;
    const { first_name, location } = req.user;
    const transaction = await sequelize.transaction();
    try {
        let existingSupplier = await Supplier.findOne({ where: { supplier_name } });
        if (!existingSupplier) {
            existingSupplier = await Supplier.create({ supplier_name }, { transaction });
        }
        // Check if there is already a purchase order for this supplier
        let existingPo = await PurchaseOrder.findOne({ where: { supplier_name }, order: [['createdAt', 'DESC']] });
        if (!existingPo) {
            // If not, generate the new Purchase Order number and create a new Purchase Order
            const poNo = await generatePoNo(transaction);
            existingPo = await PurchaseOrder.create({ po_no: poNo, supplier_name }, { transaction });
        }
        let existingStyle = await Style.findOne({ where: { style_no: styleNo } });
        if (!existingStyle) {
            existingStyle = await Style.create({
                supplier_name,
                style_no: styleNo,
                description,
                color,
                cost,
                msrp,
                first_name,
                location,
                po_no: existingPo.po_no,
            }, { transaction });
        }
        let existingAllocation = await Allocation.findOne({ where: { style_no: styleNo, poNo: existingPo.po_no } });
        if (!existingAllocation) {
            const skuNumbers = await generateSkus(receivedQty, transaction);
            existingAllocation = await Allocation.create({
                storeName,
                sizeQuantities,
                receivedQty,
                total,
                totalAllocationPerSize,
                overstockPerSize,
                style_no: styleNo,
                supplierName: supplier_name,
                poNo: existingPo.po_no,
                initial,
                first_name,
                location,
                skuNumbers
            }, { transaction });
        }
        await transaction.commit();
        res.status(200).json({
            supplier: existingSupplier,
            purchaseOrder: existingPo,
            style: existingStyle,
            allocation: existingAllocation
        });
    }
    catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).json({ message: "An error occurred while creating the resources." });
    }
});
// Read allocation data by style_no and poNo
router.get('/style_no/:style_no/poNo/:poNo', isAuthenticated, checkScope('Admin'), async (req, res) => {
    try {
        // Get the user's location from the session
        const { location } = req.user;
        const style = await Style.findOne({
            where: {
                style_no: req.params.style_no,
                location, // Make sure to fetch only the data for the user's location
            }
        });
        const allocation = await Allocation.findOne({
            where: {
                style_no: req.params.style_no,
                poNo: req.params.poNo,
                location, // Make sure to fetch only the data for the user's location
            }
        });
        if (!style)
            return res.status(404).json({ message: "Style not found" });
        if (!allocation)
            return res.status(404).json({ message: "Allocation not found" });
        res.status(200).json({ style, allocation });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "An error occurred while fetching the data." });
    }
});
router.put('/update/:allocation_id', async (req, res) => {
    const { storeName, sizeQuantities, receivedQty, total, totalAllocationPerSize, overstockPerSize, style_no, supplierName, poNo, initial } = req.body;
    // Check if an allocation with the given allocationId exists
    let allocationData = await Allocation.findOne({ where: { allocation_id: req.params.allocation_id } });
    if (!allocationData) {
        // If allocation does not exist, return error
        return res.status(404).json({ error: 'Allocation not found' });
    }
    // Update allocation
    await Allocation.update({
        storeName: storeName,
        sizeQuantities: sizeQuantities,
        receivedQty: receivedQty,
        total: total,
        totalAllocationPerSize: totalAllocationPerSize,
        overstockPerSize: overstockPerSize,
        style_no: style_no,
        supplierName: supplierName,
        poNo: poNo,
        initial: initial,
    }, {
        where: { allocation_id: req.params.allocation_id }
    });
    const updatedAllocationData = await Allocation.findOne({ where: { allocation_id: req.params.allocation_id } });
    res.status(200).json(updatedAllocationData);
});
// Update (PATCH)
router.patch('/:allocation_id', async (req, res) => {
    const allocation = await Allocation.update(req.body, {
        where: {
            allocation_id: req.params.allocation_id
        }
    });
    res.json(allocation);
});
// Delete
router.delete('/:allocation_id', async (req, res) => {
    await Allocation.destroy({
        where: {
            allocation_id: req.params.allocation_id
        }
    });
    res.json({ message: 'Allocation deleted successfully' });
});
//getAll
router.get('/', async (req, res) => {
    try {
        const allocations = await Allocation.findAll();
        res.status(200).json(allocations);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while fetching the data." });
    }
});
export default router;
