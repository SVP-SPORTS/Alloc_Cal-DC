import express, { Request, Response } from 'express';
import StoreData from '../database/storeData';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    const { storeName, sizeQuantities,  total, supplier_name, style_no } = req.body;
  
    // Check if all the required fields are present
    if (!storeName || !sizeQuantities  || !supplier_name || !style_no||  !total) {
        return res.status(400).json({ message: "Missing required data" });
    } 
  
    try {
      const data = await StoreData.create({
        storeName,
        sizeQuantities,
        total,
        supplier_name,
        style_no
       
      });
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred while creating the store." });
    }
  }); 

router.put('/:storeId', async (req, res) => {
    try {
      const { storeId } = req.params;
      const storeData = await StoreData.update(req.body, {
        where: { store_id: storeId }
      });
      res.status(200).json(storeData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred while updating the data." });
    }
  });

  export default router;
 