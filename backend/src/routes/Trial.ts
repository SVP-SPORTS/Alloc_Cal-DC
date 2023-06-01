import express, { Request, Response } from 'express';
import Data from '../database/trial';// Update with the path to your store model file

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  const { storeName, sizeQuantities,  total, supplier_name, style_no, poNo, allocation_id } = req.body;

  // Check if all the required fields are present
  if (!storeName || !sizeQuantities  || !supplier_name || !style_no) {
      return res.status(400).json({ message: "Missing required data" });
  }

  try {
    const data = await Data.create({
      storeName,
      sizeQuantities,
      total,
      supplier_name,
      style_no, 
      po_no: poNo,
      allocation_id
    
    });
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while creating the store." });
  }
}); 

router.get('/', async (req: Request, res: Response) => {
  const { style_no, po_no } = req.query;

  if (!style_no || !po_no) {
    return res.status(400).json({ message: "Missing style number or purchase order number" });
  }

  try {
    let data = await Data.findAll({ where: { style_no, po_no } });

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    // Create a set to store unique style_no and po_no combinations
    const uniqueData = new Set();

    // Filter data to only include unique style_no, po_no, and storeName combinations
    data = data.filter(row => {
      const rowValues = row.get(); // Get plain data object from Sequelize model instance
      const uniqueKey = `${rowValues.style_no}-${rowValues.po_no}-${rowValues.storeName}`;
      if (uniqueData.has(uniqueKey)) {
        return false;
      }
      uniqueData.add(uniqueKey);
      return true;
    });

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while fetching the data." });
  }
});


export default router;
 