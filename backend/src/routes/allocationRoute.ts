import express, { Request, Response } from 'express';
import Allocation from '../database/AllocationData'; // Update with the path to your allocation model file
import sequelize from '../sequelize';

const router = express.Router();


router.post('/', async (req: Request, res: Response) => {
  const { storeName, sizeQuantities, receivedQty, total, totalAllocationPerSize, overstockPerSize, style_no, supplierName, poNo, allocation_id , initial} = req.body;

  // Check if all the required fields are present
  if (!storeName || !sizeQuantities || !receivedQty || !total || !totalAllocationPerSize || !overstockPerSize || !style_no || !supplierName || !poNo) {
    return res.status(400).json({ message: "Missing required data" });
  }

  const transaction = await sequelize.transaction();

  try {
    const allocation = await Allocation.create({
      storeName,
      sizeQuantities,
      receivedQty,
      total,
      totalAllocationPerSize,
      overstockPerSize,
      style_no, 
      supplierName,
      poNo, 
      allocation_id,
      initial
    }, { transaction });

    await transaction.commit();

    res.status(200).json(allocation);
  } catch (error) {
    
    console.error(error);
    res.status(500).json({ message: "An error occurred while creating the allocation." });
  }
});

// Read allocation data by style_no and poNo
router.get('/style_no/:style_no/poNo/:poNo', async (req: Request, res: Response) => {
  Allocation.findOne({ 
    where: { 
      style_no: req.params.style_no, 
      poNo: req.params.poNo 
    } 
  })
  .then(allocation => {
    if (!allocation) return res.status(404).json({ message: "Allocation not found" });
    res.status(200).json(allocation);
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({ message: "An error occurred while fetching the data." });
  });
});

router.put('/update/:allocation_id', async (req: Request, res: Response) => {
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
router.get('/', async (req: Request, res: Response) => {
  try {
    const allocations = await Allocation.findAll();
    res.status(200).json(allocations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while fetching the data." });
  }
});

export default router; 
