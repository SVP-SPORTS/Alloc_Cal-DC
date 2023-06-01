import express, { Request, Response } from 'express';
import PurchaseOrder from '../database/po';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    const { poNo, supplierName } = req.body;

    

    try {
        const newPO = await PurchaseOrder.create({
            po_no : poNo,
            supplier_name: supplierName
        });

        res.status(200).json(newPO);
    } catch (error) {
        console.error("Error creating PO:", error);
        res.status(500).json({ error: 'An error occurred while creating the purchase order' });
    }
});  

export default router; 
   