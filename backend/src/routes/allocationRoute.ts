import express, { NextFunction, Request, Response } from 'express';
import Allocation from '../database/AllocationData'; // Update with the path to your allocation model file
import sequelize from '../sequelize';
import { isAuthenticated, checkScope } from '../Auth/authMiddleware';
import PurchaseOrder from '../database/PurchaseOrderData';
import Supplier from '../database/SupplierData';
import Style from '../database/StyleData';
import { Op, Transaction } from 'sequelize';
import SKUCounter from '../database/SKU';


const router = express.Router();

// Add this function to generate SKU numbers
async function generateSkus(receivedQty: any, transaction: Transaction) {
  let skuCounter = await SKUCounter.findOne({ order: [['counter', 'ASC']], transaction });
  
  if (!skuCounter) {
    skuCounter = await SKUCounter.create({ counter: 12345678 }, { transaction });
  }

  const skus = receivedQty.map((receivedQty: any) => {
    return (skuCounter!.counter--).toString();
  });

  await skuCounter!.save({ transaction });

  return skus;
}


//GENERATE poNo
async function generatePoNo(transaction: Transaction) {
  const latestPo = await PurchaseOrder.findOne({
    order: [
      [sequelize.fn("right", sequelize.col("po_no"), 5), "DESC"],
    ],
    transaction
  });

  let poNo = "SVP99999";
  if (latestPo) {
    const latestPoNo = parseInt(latestPo.po_no.substring(3));
    const newPoNo = latestPoNo + 1;
    poNo = "SVP" + newPoNo.toString().padStart(5, '0');
  }

  return poNo; 
}

router.post('/create', isAuthenticated, checkScope('Admin'), async (req: Request, res: Response, next: NextFunction) => {
  const { supplier_name, styleNo, description, color, cost, msrp, storeName, sizeQuantities, showOnWeb, receivedQty, total, status, totalAllocationPerSize, overstockPerSize, initial, poNo } = req.body;
  const { first_name, location } = req.user as IUserSessionInfo;

  const transaction = await sequelize.transaction();

  try {
    // Use upsert for Supplier
    await Supplier.upsert({ supplier_name }, { transaction });

    let existingSupplier = await Supplier.findOrCreate({ where: { supplier_name } });
    // Check if there is already a purchase order for the provided poNo
    let existingPo = await PurchaseOrder.findOne({ where: { po_no: poNo }, transaction });

    if (!existingPo) {
      // If not, create a new Purchase Order using the provided poNo
      existingPo = await PurchaseOrder.create({ po_no: poNo, supplier_name }, { transaction });
    }

    // Use upsert for Style
    await Style.upsert({
        supplier_name,
        style_no: styleNo,
        description,
        color,
        cost,
        receivedQty,
        msrp,
        first_name,
        location,
        po_no: poNo,  // Use the provided poNo
    }, { transaction });

    let existingStyle = await Style.findOne({ where: { style_no: styleNo } });

    // Use upsert for Allocation
    const skuNumbers = await generateSkus(receivedQty, transaction);
    let existingAllocation = await Allocation.findOne({ where: { style_no: styleNo} });
    await Allocation.upsert({
        storeName,
        sizeQuantities,
        receivedQty,
        total,
        status,
        totalAllocationPerSize,
        overstockPerSize,
        style_no: styleNo,
        supplierName: supplier_name,
        poNo: poNo,  // Use the provided poNo
        initial,
        first_name,
        location,
        skuNumbers,
        showOnWeb,
    }, { transaction });
    

    await transaction.commit();

    res.status(200).json({
      supplier: existingSupplier,
      purchaseOrder: existingPo,
      style: existingStyle,
      allocation: existingAllocation
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: "An error occurred while creating the resources." });
  }
});


//SHOW ON WEB

router.get('/get/:storeName',isAuthenticated,checkScope('User'), async (req: Request, res: Response) => {
  const { storeName } = req.params; 
// Get the user's location from the session
const { location } = req.user as IUserSessionInfo;

  try { 
    // Define the where condition for the query based on the storeName and location
   
    const whereCondition: any = {
      showOnWeb: true,
      location,
      storeName: {
        [Op.contains]: [storeName],
      },
    };
  

    // Fetch allocations for the given store
    const allocations = await Allocation.findAll({
      where: whereCondition,
      include: [
        {
          model: PurchaseOrder,
          as: 'PurchaseOrders',
          attributes: ['po_no'],
        },
        {
          model: Style,
          as: 'styles',
          required: true,
          attributes: ['style_no', 'description', 'color', 'cost', 'msrp'],
        },
        {
          model: Supplier,
          as: 'suppliers',
          attributes: ['supplier_name'],
        },
      ],
    });  

    // Transform sequelize instances to plain objects
    const plainAllocations = allocations.map((allocation) => allocation.toJSON());

    // Adjust the allocations to only include sizeQuantities for the specified store
    const adjustedAllocations = plainAllocations.map((allocation: any) => {
      const storeIndex = allocation.storeName.indexOf(storeName);
      const sizeQuantities = allocation.sizeQuantities[storeIndex];
      const initial = allocation.initial[storeIndex];

      // Return a new allocation object with adjusted sizeQuantities
      return { ...allocation, sizeQuantities, initial };
    });
 
    res.json(adjustedAllocations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching data.' });
  }
});



// Read allocation data by style_no and poNo
router.get('/style_no/:style_no/poNo/:poNo',isAuthenticated,checkScope('Admin'), async (req: Request, res: Response) => {
  try {
    // Get the user's location from the session
    const { location } = req.user as IUserSessionInfo;

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

    if (!style) return res.status(404).json({ message: "Style not found" });
    if (!allocation) return res.status(404).json({ message: "Allocation not found" });

    res.status(200).json({ style, allocation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred while fetching the data." });
  }
});



router.put('/update/:allocation_id', isAuthenticated,checkScope( 'Admin'),async (req: Request, res: Response) => {
  const { storeName, sizeQuantities, receivedQty, total,totalAllocationPerSize, overstockPerSize,status, style_no, supplierName, poNo, initial } = req.body;

  const { location } = req.user as IUserSessionInfo;

  // Check if an allocation with the given allocationId exists
  let allocationData = await Allocation.findOne({ where: { allocation_id: req.params.allocation_id } });

  if (!allocationData) { 
    // If allocation does not exist, return error
    return res.status(404).json({ error: 'Allocation not found' });
  } 

  // Determine the storeIndex based on the storeName
  const storeIndex = allocationData.storeName.indexOf(storeName);

 // Update the initial and status values at the specified storeIndex
 if (storeIndex !== -1 && initial && typeof status === 'boolean') {
  // Make copies of the existing initial and status values
  const updatedInitial = [...allocationData.initial];
  const updatedStatus = [...allocationData.status];

  // Update the values at the specified storeIndex
  updatedInitial[storeIndex] = initial;
  updatedStatus[storeIndex] = status;


  // Update allocation
  await Allocation.update({
    
    sizeQuantities: sizeQuantities,
    receivedQty: receivedQty,
    total: total,
    totalAllocationPerSize: totalAllocationPerSize,
    overstockPerSize: overstockPerSize,
    style_no: style_no,
    supplierName: supplierName,
    poNo: poNo,
    initial: updatedInitial, 
    status: updatedStatus,
    
  }, {
    where: { allocation_id: req.params.allocation_id }
  });

  const updatedAllocationData = await Allocation.findOne({ where: { allocation_id: req.params.allocation_id, location } });
  res.status(200).json(updatedAllocationData);
}
else {
  // Handle error if storeIndex is not found or initial value is not provided
  res.status(400).json({ error: 'Invalid store name or initial value' });
}
});
////FOR LEADER
router.put('/updated/:allocation_id', isAuthenticated,checkScope('Admin'),async (req: Request, res: Response) => {
  const { storeName, sizeQuantities, receivedQty, total,totalAllocationPerSize, overstockPerSize, style_no, supplierName, poNo, initial } = req.body;

  const { location } = req.user as IUserSessionInfo;

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
    showOnWeb: false
    
  }, {
    where: { allocation_id: req.params.allocation_id }
  });

  const updatedAllocationData = await Allocation.findOne({ where: { allocation_id: req.params.allocation_id, location } });
  res.status(200).json(updatedAllocationData);
});
 
// Update (PATCH)
router.patch('/:allocation_id',isAuthenticated,checkScope( 'SuperAdmin'), async (req, res) => {
  const allocation = await Allocation.update(req.body, {
    where: {
      allocation_id: req.params.allocation_id
    }
  });
  res.json(allocation);
});

// Delete
router.delete('/:allocation_id',isAuthenticated,checkScope('SuperAdmin') ,async (req, res) => {
  await Allocation.destroy({
    where: {
      allocation_id: req.params.allocation_id
    }
  });
  res.json({ message: 'Allocation deleted successfully' });
});

// get all
router.get('/', async (req: Request, res: Response) => {
  // Extract location from the authenticated user
 

  try {
  
    const allocations = await Allocation.findAll({
     
      include: [{
        model: Style,
        as: 'styles',
        required: true
      }]
    });

    res.status(200).json(allocations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while fetching the data." });
  }
});


// showOnWeb

router.put('/updateShowOnWeb/:style_no/:poNo', isAuthenticated, checkScope('Admin'), async (req: Request, res: Response) => {
  const { style_no, poNo } = req.params;
  const { showOnWeb } = req.body; // Extract showOnWeb from the request body

  try {
    // Find the allocation by style_no and poNo
    const allocation = await Allocation.findOne({ where: { style_no, poNo } });

    if (!allocation) {
      return res.status(404).json({ message: "Allocation not found" });
    }

    // Update showOnWeb property
    allocation.showOnWeb = showOnWeb;
    await allocation.save();

    res.status(200).json({ message: 'Show on web updated successfully', allocation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while updating the showOnWeb property." });
  }
});


export default router; 
