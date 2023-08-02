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

router.post('/create', isAuthenticated, checkScope('Admin' && 'SuperAdmin'), async (req: Request, res: Response, next: NextFunction) => {
  const { supplier_name, styleNo, description, color, cost, msrp, storeName, sizeQuantities,showOnWeb, receivedQty, total, totalAllocationPerSize, overstockPerSize, initial } = req.body;
  const { first_name, location } = req.user as IUserSessionInfo;

  const transaction = await sequelize.transaction();

  try {
    // Use upsert for Supplier
    await Supplier.upsert({ supplier_name }, { transaction });

    let existingSupplier = await Supplier.findOrCreate({ where: { supplier_name } });

    // Check if there is already a purchase order for this supplier
    let existingPo = await PurchaseOrder.findOne({ where: { supplier_name }, order: [ [ 'createdAt', 'DESC' ] ], transaction });

    if (!existingPo) {
      // If not, generate the new Purchase Order number and create a new Purchase Order
      const poNo = await generatePoNo(transaction);
      existingPo = await PurchaseOrder.create({ po_no: poNo, supplier_name }, { transaction });
    }

    // Use upsert for Style
    await Style.upsert({
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

    let existingStyle = await Style.findOne({ where: { style_no: styleNo } });

    // Use upsert for Allocation
    const skuNumbers = await generateSkus(receivedQty, transaction);

    let existingAllocation = await Allocation.findOne({ where: { style_no: styleNo} });
    await Allocation.upsert({
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

router.get('/get/:storeName?/:styleNo?', async (req: Request, res: Response) => {
  const { storeName, styleNo } = req.params;
  const { location } = req.user as IUserSessionInfo;

  try {
    if (storeName && styleNo) {
      // If both storeName and styleNo are provided, fetch allocations
      const whereCondition: any = {
        showOnWeb: true,
        location,
        storeName: {
          [Op.contains]: [storeName],
        },
      };
  
      whereCondition['$styles.style_no$'] = styleNo;

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

        // Return a new allocation object with adjusted sizeQuantities
        return { ...allocation, sizeQuantities };
      });

      res.json(adjustedAllocations);
    } else {
      // If only storeName or no parameters are provided, fetch styles
      const styles = await Allocation.findAll({
        where: {
          showOnWeb: true,
        },
        attributes: ['style_no'],
      });

      // Transform sequelize instances to plain objects
      const plainStyles = styles.map((style) => style.toJSON());
    
      // Extract style numbers
      const styleNos = plainStyles.map((style: any) => style.style_no);
    
      res.json(styleNos);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching data.' });
  }
});



// Read allocation data by style_no and poNo
router.get('/style_no/:style_no/poNo/:poNo',isAuthenticated,checkScope('User' && 'Admin' && 'SuperAdmin'), async (req: Request, res: Response) => {
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



router.put('/update/:allocation_id', isAuthenticated,checkScope('User' && 'Admin' && 'SuperAdmin'),async (req: Request, res: Response) => {
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

router.get('/', async (req: Request, res: Response) => {
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

export default router; 
