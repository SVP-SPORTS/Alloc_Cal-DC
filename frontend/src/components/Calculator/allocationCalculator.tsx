/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, Center, Checkbox, Col, Container, Flex, Grid, Group, Input, MantineProvider, Modal, Popover, Table, Text } from '@mantine/core';
import axios from 'axios';
import { ChangeEvent, forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import Header from './styleInputTable';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions } from 'pdfmake/interfaces';



pdfMake.vfs = pdfFonts.pdfMake.vfs;







type SizeQuantity = {
  size: string;
  quantity: number;
};
type StoreData = {
  storeName: string;
  sizeQuantities: SizeQuantity[];
};

interface AllocProps { }

const Alloc: React.ForwardRefRenderFunction<{ reset: () => void }, AllocProps> = (_props, ref) => {
  const [sizes, setSizes] = useState<string[]>([]);
 
  const [tableData, setTableData] = useState<StoreData[]>([]);
  const [totalProductionQuantities, setTotalProductionQuantities] = useState<number[]>([]);
  const [standardQuantities, setStandardQuantities] = useState<number[]>(new Array(13).fill(0));
  const [totalProductionSum, setTotalProductionSum] = useState<number>(0);
  const [calculateClicked, setCalculateClicked] = useState(false);
  const [totalStdQty, setTotalStdQty] = useState(0);
  const [overstockStore, setOverstockStore] = useState<string | null>(null);
  const [supplierName, setSupplierName] = useState('');
  const [styleNo, setStyleNo] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [cost, setCost] = useState('');
  const [msrp, setMsrp] = useState('');
  const [poNo, setPoNo] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  



  const storeNames = [
    'STEELES', 'WEB', 'OPM', 'VAUGHAN', 'NIAGARA', 'ALLISTON',
    'SCARBOROUGH', 'CARTWRIGHT', 'BRAMPTON', 'PICKERING', 'YORKGATE', 'OPM-HAMILTON', 'SC SuperStore'
  ];

  const [stores, setStores] = useState<string[]>(storeNames);
  const [allChecked, setAllChecked] = useState<boolean>(true);


  const downloadPDF = () => {
    const body: any[]= [];

    // Number of sizes plus two additional columns for 'Store' and 'Total'

    // Add headers to the table
    const header = ['Store', ...sizes, 'Total', 'INITIALS'];
    body.push(header);
  

    const totalProductionQty = ['RCV QTY', ...sizes.map((_, index) => totalProductionQuantities[index]), totalProductionSum,  ''];
    body.push(totalProductionQty);


    // Add your table data here, looping through tableData, for example
    tableData.forEach((row,index:number) => {
      const rowData = [
        row.storeName,
        ...row.sizeQuantities.map(sq => sq.quantity),
        calculateRowTotal(index),
        ''
      ];
      body.push(rowData);
    });
   
    // Add total allocation row
  const totalAllocationRow = ['Total Allocation', ...sizes.map((_, index) => calculateTotalAllocation(index)),calculateTotalSizeQuantitiesSum(), ''];
  body.push(totalAllocationRow);

  // Add overstock row
  const overstockRow = ['Overstock', ...sizes.map((_, index) => calculateOverstock(index)),  Math.max(totalProductionSum - calculateTotalSizeQuantitiesSum()), ''];
  body.push(overstockRow);

 
   
    // Define PDF content
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'LETTER',
      pageOrientation: 'landscape',
      content: [
  {
    stack: [
      {
        text: 'SVP SPORTS - DISTRIBUTION CENTER', fontSize: 24,
      bold: true,
      alignment: 'center',
      margin: [0, 0, 0, 10]
    },
    { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 700, y2: 5, lineWidth: 0.5, lineColor: '#d0d0d0' }] }, // Horizontal line  
      {
        columns: [    
          { text: `#PO: ${poNo}`, style: 'header' },      
          { text: `Supplier: ${supplierName}`, style: 'header' },
                 
        ],
        // Optional space between columns
        columnGap: 10,
      },
      { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 700, y2: 5, lineWidth: 0.5, lineColor: '#d0d0d0' }] }, // Horizontal line
      {
        columns: [    
         
          { text: `StyleNo: ${styleNo}`, style: 'header' },         
        ],
        // Optional space between columns
        columnGap: 10,
      },
      { text: `Description: ${description}`, style: 'subheader' },
      { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 700, y2: 5, lineWidth: 0.5, lineColor: '#d0d0d0' }] }, // Horizontal line
      {
        columns: [
          { text: `Color: ${color}`, style: 'subheader' },
          { text: `Cost: ${cost}`, style: 'subheader' },
          { text: `MSRP: ${msrp}`, style: 'subheader' },
        ],
        // Optional space between columns
        columnGap: 5,
      },
      { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 700, y2: 5, lineWidth: 0.5, lineColor: '#d0d0d0' }] }, // Horizontal line
    ],
  },
  {text: '', margin: [0,0,0,10]},
  {
    columns: [
      { width: '*', text: '' }, // Empty column for centering
      {
        width: 'auto',
        alignment: 'center',
        table: {
          body: body,
          
        },
        layout: {
          hLineWidth: function () {
            return 1; // Thickness of horizontal lines
          },
          vLineWidth: function () {
            return 1; // Thickness of vertical lines
          },
          hLineColor: function () {
            return '#d0d0d0'; // Color of horizontal lines
          },
          vLineColor: function () {
            return '#d0d0d0'; // Color of vertical lines
          },
          paddingLeft :() => 3,
          paddingRight: () => 3,
          paddingTop: () => 3,
          paddingBottom: () => 1,
          
        }
      },
      { width: '*', text: '' } // Empty column for centering
    ],
    columnGap: 10
  }
      
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 14,
          bold: true,
          alignment: 'center',
          margin: [0, 10, 0, 5]
        },
        subheader1: {
          fontSize: 14,
          bold: true,
          alignment: 'center',
          margin: [0, 10, 0, 35]
        }
      }
    };
   

    // Create the PDF and open it in a new window
    pdfMake.createPdf(docDefinition).open();
  };
  

  useEffect(() => {
    updateTableData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizes, stores]);

  useEffect(() => {
    const newSum = totalProductionQuantities.reduce((total, currentQuantity) => total + currentQuantity, 0);
    setTotalProductionSum(newSum);
  }, [totalProductionQuantities]);


  const onSave = async () => {

    const statusArray = Array(tableData.length).fill(false);
    const initialArray = Array(tableData.length).fill('SVP');
    const data = {
      poNo: poNo,
      supplier_name: supplierName,
      styleNo: styleNo,
      description: description,
      color: color,
      cost: cost,
      msrp: msrp,
      status: statusArray,
      storeName: tableData.map(data => data.storeName),
      sizeQuantities: tableData.map(data => data.sizeQuantities),
      receivedQty: sizes.map((size, index) => ({
        size: size,
        quantity: totalProductionQuantities[index],
      })),
      total: totalProductionQuantities.reduce((a, b) => a + b, 0),
      totalAllocationPerSize: sizes.map((_size, index) => calculateTotalAllocation(index)),
      overstockPerSize: sizes.map((_size, index) => calculateOverstock(index)),
      // assuming that allocationId is available
      initial: initialArray
    };

    try {
      const response = await axios.post('http://localhost:5000/api/allocation/create', data, { withCredentials: true });

      if (response.status === 200) {
        setMessage('Data saved successfully');
        setIsError(false);
        reset(true); // Pass true to skip save confirmation
      } else {
        setMessage('Error while saving data');
        setIsError(true);
      }
      setModalIsOpen(true); // Open the modal
    } catch (error: any) {
      setMessage('Error while saving data: ' + error.message);
      setIsError(true);
      setModalIsOpen(true); // Open the modal
    }
    alert('Data Saved Successfully!');
  }; 









  const updateTableData = () => {
    let data = stores.map((store) => {
      return {
        storeName: store,
        sizeQuantities: sizes.map((size) => {
          return {
            size: size,
            quantity: 0,
          };
        }),
      };
    });
    setTableData(data);
  };

  const handleSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newSizes = event.target.value.split(',');
    setSizes(newSizes);
  };

  //handle Calculate
  // Your priority stores list should be in descending order of priority.
  const priorityStores = [
    'STEELES', 'WEB','SC SuperStore', 'OPM', 'VAUGHAN', 'BRAMPTON',  'OPM-HAMILTON', 'NIAGARA', 'SCARBOROUGH', 'CARTWRIGHT', 'ALLISTON', 'PICKERING', 'YORKGATE'
  ];

 
  const allocateSizesToStores = (): void => {
    const newTableData: StoreData[] = [...tableData];
    const totalAllocatedQty: number[] = new Array(newTableData.length).fill(0);
    const totalProductionQuantity: number = totalProductionQuantities.reduce((total: number, qty: number) => total + qty, 0);
    // Calculate the total standard quantity across all stores
    const totalStandardQuantity = standardQuantities.reduce((total, qty) => total + qty, 0);

    const remainingQuantities: number[] = [...totalProductionQuantities];

      // Check if the total standard quantity is more than the total production quantity
      if (totalStandardQuantity > totalProductionQuantity) {
        // If it is, display an error message and terminate the function
        alert('You are over ambitious. The total standard quantity should not exceed the total production quantity.');
        
      }



    //Step 1: Initialize
    // Create a mapping of store names to priorities
    let storePriorities: { [storeName: string]: number } = {};
    priorityStores.forEach((storeName, index) => {
      storePriorities[storeName] = index;
    });
    //let storePriorities: { [storeName: string]: number } = {};
    priorityStores.forEach((storeName, index) => {
      storePriorities[storeName] = index;
    });

    // Sort the stores by their priorities. Lower priority values mean higher priority.
    let sortedStores = newTableData.map((storeData) => ({
      data: storeData,
      priority: storePriorities[storeData.storeName],
    })).sort((a, b) => a.priority - b.priority);

    sortedStores.forEach(({ data: storeData }, storeIndex) => {
      storeData.sizeQuantities.forEach((sizeData: SizeQuantity) => {
        sizeData.quantity = 0; // Reset to zero
      });
  
      const storeProportion: number = standardQuantities[storeIndex] / totalProductionQuantity;
  
      storeData.sizeQuantities.forEach((sizeData: SizeQuantity, sizeIndex: number) => {
        let sizeAllocation: number = Math.floor(totalProductionQuantities[sizeIndex] * storeProportion);
  
        // Ensure that the size allocation is at least 1 if there's enough quantity
        if (sizeAllocation === 0 && remainingQuantities[sizeIndex] > 0) {
          sizeAllocation = 1;
          remainingQuantities[sizeIndex] -= 1;
        }
  
        // Check and adjust if the size allocation would cause the store's total allocation to exceed its standard quantity
        const remainingStoreQty = standardQuantities[storeIndex] - totalAllocatedQty[storeIndex];
        if (sizeAllocation > remainingStoreQty) {
          sizeAllocation = remainingStoreQty;
        }
  
        // Update size allocation, ensuring it doesn't exceed the production quantity
        sizeAllocation = Math.min(sizeAllocation, remainingQuantities[sizeIndex], totalProductionQuantities[sizeIndex]);
  
        // Update the remaining quantities for that size
        remainingQuantities[sizeIndex] -= sizeAllocation;
  
        sizeData.quantity += sizeAllocation;
        totalAllocatedQty[storeIndex] += sizeAllocation;
      });
    });
    
      // Grouping stores by their standard quantities
      const groupedStores: {[standardQty: number]: StoreData[]} = {};
      newTableData.forEach((store, index) => {
        if (!groupedStores[standardQuantities[index]]) {
          groupedStores[standardQuantities[index]] = [];
        }
        groupedStores[standardQuantities[index]].push(store);
      });
  
      // Calculating and assigning allocations for each group
      Object.keys(groupedStores).forEach(standardQtyStr => {
        const standardQty = parseInt(standardQtyStr);
        const stores = groupedStores[standardQty];
        const storeProportion: number = standardQty / totalProductionQuantity;
  
        stores.forEach(store => {
          store.sizeQuantities.forEach((sizeData: SizeQuantity, sizeIndex: number) => {
            sizeData.quantity = 0;  // Reset to zero
            let sizeAllocation: number = Math.floor(totalProductionQuantities[sizeIndex] * storeProportion);
  
            // Ensure that the size allocation is at least 1 if there's enough quantity
            if (sizeAllocation === 0 && remainingQuantities[sizeIndex] > 0) {
              sizeAllocation = 1;
              remainingQuantities[sizeIndex] -= 1;
            }
  
            // Update the remaining quantities for that size
            remainingQuantities[sizeIndex] -= sizeAllocation;
            sizeData.quantity += sizeAllocation;
          });
        });
      });
  
 // Step 2: Redistribute quantities to minimize variance
 const calculateVariance = (sizeIndex: number): number => {
  // Calculate mean
  const mean: number = newTableData.reduce((total: number, storeData: StoreData) => total + (storeData.sizeQuantities[sizeIndex]?.quantity || 0), 0) / newTableData.length;

  // Calculate variance
  const variance: number = newTableData.reduce((total: number, storeData: StoreData) => total + Math.pow((storeData.sizeQuantities[sizeIndex]?.quantity || 0) - mean, 2), 0) / newTableData.length;

  return variance;
};

// Optimize each size's quantity separately
for (let s = 0; s < newTableData[0].sizeQuantities.length; s++) {
  let improvement: boolean = true;
  while (improvement) {
    improvement = false;
    for (let i = 0; i < newTableData.length - 1; i++) {
      for (let j = i + 1; j < newTableData.length; j++) {
        // Try swapping quantities and see if it improves variance
        const tmp: number = newTableData[i].sizeQuantities[s].quantity;
        newTableData[i].sizeQuantities[s].quantity = newTableData[j].sizeQuantities[s].quantity;
        newTableData[j].sizeQuantities[s].quantity = tmp;

        const varianceAfter: number = calculateVariance(s);
        // Also, check if the swap would cause either store's total allocation to exceed its standard quantity
        const iTotal = newTableData[i].sizeQuantities.reduce((total, sq) => total + sq.quantity, 0);
        const jTotal = newTableData[j].sizeQuantities.reduce((total, sq) => total + sq.quantity, 0);
        if (varianceAfter < calculateVariance(s) && iTotal <= standardQuantities[i] && jTotal <= standardQuantities[j]) {
          // Improvement! Keep the swap and continue searching
          improvement = true;
        } else {
          // No improvement. Swap back
          newTableData[j].sizeQuantities[s].quantity = newTableData[i].sizeQuantities[s].quantity;
          newTableData[i].sizeQuantities[s].quantity = tmp;
        }
      }
    }
  }
}

// Step 3: Distribute remaining quantities
for (let s = 0; s < newTableData[0].sizeQuantities.length; s++) {
  let totalSizeQty = totalProductionQuantities[s];
  let allocatedSizeQty = newTableData.reduce((total: number, storeData: StoreData) => total + (storeData.sizeQuantities[s]?.quantity || 0), 0);
  let remainingSizeQty = totalSizeQty - allocatedSizeQty;

  // Sort the priority stores by their current allocation of the size
  const priorityStoresForSize = priorityStores.slice().sort((storeNameA, storeNameB) => {
    const storeIndexA = newTableData.findIndex(storeData => storeData.storeName === storeNameA);
    const storeIndexB = newTableData.findIndex(storeData => storeData.storeName === storeNameB);

    const sizeQtyA = newTableData[storeIndexA]?.sizeQuantities[s]?.quantity || 0;
    const sizeQtyB = newTableData[storeIndexB]?.sizeQuantities[s]?.quantity || 0;

    return sizeQtyA - sizeQtyB;  // Change this to `sizeQtyB - sizeQtyA` for descending order
  });

  priorityStoresForSize.forEach(storeName => {
    const storeIndex = newTableData.findIndex(storeData => storeData.storeName === storeName);
    if (storeIndex === -1) return;

    const storeTotalQuantity = newTableData[storeIndex].sizeQuantities.reduce((total: number, sizeData: SizeQuantity) => total + sizeData.quantity, 0);

    // Check if increasing the size's allocation would cause the store's total allocation to exceed its standard quantity
    if (remainingSizeQty > 0 && storeTotalQuantity + 1 <= standardQuantities[storeIndex]) {
      newTableData[storeIndex].sizeQuantities[s].quantity += 1;
      remainingSizeQty -= 1;
    }
  });
}

  // Step 4: Verify and adjust quantities to match the production quantity for each size
  for (let s = 0; s < totalProductionQuantities.length; s++) {
    let totalSizeQty = totalProductionQuantities[s];
    let allocatedSizeQty = newTableData.reduce((total, storeData) => total + storeData.sizeQuantities[s].quantity, 0);
  
    while (allocatedSizeQty > totalSizeQty) {
      // Find the store with the highest allocation of this size
      let maxQtyStoreIndex = newTableData.reduce((maxIndex, storeData, index, arr) =>
        storeData.sizeQuantities[s].quantity > arr[maxIndex].sizeQuantities[s].quantity ? index : maxIndex,
        0
      );
  
      // Decrease the quantity of the size in the store with the highest allocation
      newTableData[maxQtyStoreIndex].sizeQuantities[s].quantity -= 1;
  
      allocatedSizeQty -= 1;
    }
  
    // Reallocate the removed quantities to sizes that have not reached their total production quantities yet
    while (allocatedSizeQty < totalSizeQty) {
      // Find a size that has not reached its total production quantity yet
      let availableSizeIndex = newTableData[0].sizeQuantities.findIndex((sq, index) => 
        newTableData.reduce((total, storeData) => total + storeData.sizeQuantities[index].quantity, 0) < totalProductionQuantities[index]
      );
  
      // Find the store with the lowest allocation of this size
      let minQtyStoreIndex = newTableData.reduce((minIndex, storeData, index, arr) =>
        storeData.sizeQuantities[availableSizeIndex].quantity < arr[minIndex].sizeQuantities[availableSizeIndex].quantity ? index : minIndex,
        0
      );
  
      // Increase the quantity of the size in the store with the lowest allocation
      newTableData[minQtyStoreIndex].sizeQuantities[availableSizeIndex].quantity += 1;
  
      allocatedSizeQty += 1;
    }
  }

  // Step 4.1: Distribute remaining quantities across stores
for (let s = 0; s < totalProductionQuantities.length; s++) {
  let remainingSizeQty = totalProductionQuantities[s] - newTableData.reduce((total, storeData) => total + storeData.sizeQuantities[s].quantity, 0);

  // Distribute the remaining quantities across stores based on priority
  priorityStores.forEach(storeName => {
    const storeIndex = newTableData.findIndex(storeData => storeData.storeName === storeName);
    if (storeIndex === -1 || remainingSizeQty <= 0) return;

    // Increase the quantity of the size in the store if possible
    if (newTableData[storeIndex].sizeQuantities[s].quantity < totalProductionQuantities[s] && newTableData[storeIndex].sizeQuantities.reduce((total, sq) => total + sq.quantity, 0) < standardQuantities[storeIndex]) {
      newTableData[storeIndex].sizeQuantities[s].quantity += 1;
      remainingSizeQty -= 1;
    }
  });
}


 // Step 5: Adjust quantities to match the standard quantity for each store

const overstock: number[] = totalProductionQuantities.map((totalQty, sizeIndex) => {
  const totalAllocated = newTableData.reduce((sum, storeData) => sum + storeData.sizeQuantities[sizeIndex].quantity, 0);
  return totalQty - totalAllocated;
});

newTableData.forEach((storeData, storeIndex) => {
  let totalStoreQty = storeData.sizeQuantities.reduce((total, sq) => total + sq.quantity, 0);

  while (totalStoreQty > standardQuantities[storeIndex]) {
    let maxQtyIndex = -1;
    storeData.sizeQuantities.forEach((sq, index) => {
      if (sq.quantity > (maxQtyIndex === -1 ? -1 : storeData.sizeQuantities[maxQtyIndex].quantity) && overstock[index] < totalProductionQuantities[index]) {
        maxQtyIndex = index;
      }
    });

    if (maxQtyIndex === -1) break;

    storeData.sizeQuantities[maxQtyIndex].quantity -= 1;
    overstock[maxQtyIndex] += 1;

    totalStoreQty -= 1;
  }

  while (totalStoreQty < standardQuantities[storeIndex]) {
    let minQtyIndex = overstock.findIndex((qty, index) => qty > 0 && storeData.sizeQuantities[index].quantity < totalProductionQuantities[index]);

    if (minQtyIndex === -1) break;

    storeData.sizeQuantities[minQtyIndex].quantity += 1;
    overstock[minQtyIndex] -= 1;

    totalStoreQty += 1;
  }
});
    // Update state
    setTableData(newTableData);
  };











  // Use useEffect to recalculate allocations when needed
  useEffect(() => {
    if (calculateClicked) {
      allocateSizesToStores();
      setCalculateClicked(false);
    }
  }, [standardQuantities, totalProductionQuantities, calculateClicked]);

  // Handler for button click
  const handleCalculateClick = () => {
    allocateSizesToStores();
    setCalculateClicked(true);
  };



  //Calculate OVERSTOCK
  const allocateOverstockToStore = (tableData: StoreData[], overstockStore: string | null) => {
    if (!overstockStore) {
      return tableData;
    }

    const overstockStoreData = tableData.find(storeData => storeData.storeName === overstockStore);
    if (!overstockStoreData) {
      return tableData;
    }

    const newTableData = [...tableData];

    overstockStoreData.sizeQuantities.forEach((sizeData, sizeIndex) => {
      const overstock = calculateOverstock(sizeIndex);
      if (overstock > 0) {
        sizeData.quantity += overstock;
      }
    });

    return newTableData;
  };



  const handleAllCheckedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAllChecked(event.target.checked);

    if (event.target.checked) {
      // If "Check All" is checked, add all store names to the stores state
      setStores(storeNames);
      const newData = storeNames.map((storeName) => {
        return {
          storeName: storeName,
          sizeQuantities: sizes.map((size) => {
            return {
              size: size,
              quantity: 0,
            };
          }),
        };
      });
      setTableData(newData);
    } else {
      // If "Check All" is unchecked, clear the stores and tableData states
      setStores([]);
      setTableData([]);
    }
  };

  const handleStoreChange = (event: React.ChangeEvent<HTMLInputElement>, storeName: string) => {
    const storeIndex = storeNames.indexOf(storeName);
    const newData = [...tableData];

    if (!event.target.checked) {
        // Remove the store from the table data and stores state if it's unchecked
        const updatedData = newData.filter((row) => row.storeName !== storeName);
        setTableData(updatedData);
        setStores(stores.filter((store) => store !== storeName));
        setAllChecked(false); // uncheck the "Check All" checkbox

        // Reset the standard quantity for the unchecked store without affecting the others
        const newStandardQuantities = [...standardQuantities];
        newStandardQuantities[storeIndex] = 0;
        setStandardQuantities(newStandardQuantities);
    } else {
        // Only add the store back to the table and stores state if it's not already there
        if (!stores.includes(storeName)) {
            setStores(prevStores => [...prevStores, storeName]);
            const newRow = {
                storeName: storeName,
                sizeQuantities: sizes.map((size) => {
                    return {
                        size: size,
                        quantity: 0,
                    };
                }),
            };

            // Remove any previous data for the store
            const withoutStoreData = newData.filter(row => row.storeName !== storeName);
            withoutStoreData.push(newRow);
            setTableData(withoutStoreData);

            // Re-add the standard quantity for the checked store
            const newStandardQuantities = [...standardQuantities];
            newStandardQuantities[storeIndex] = 0; // or any default value you'd like
            setStandardQuantities(newStandardQuantities);

            setAllChecked(stores.length + 1 === storeNames.length); // check the "Check All" checkbox if all stores are checked
        }
    }
};







  const handleQuantityChange = (
    event: ChangeEvent<HTMLInputElement>,
    storeIndex: number,
    sizeIndex: number
  ) => {
    const newData = [...tableData];
    newData[storeIndex].sizeQuantities[sizeIndex].quantity = parseInt(
      event.target.value,
      10
    ) || 0;
    setTableData(newData);
  };

  const handleTotalProductionQuantityChange = (event: ChangeEvent<HTMLInputElement>, sizeIndex: number) => {
    const newTotalProductionQuantity = parseInt(event.target.value, 10) || 0;
    const newTotalProductionQuantities = [...totalProductionQuantities];
    newTotalProductionQuantities[sizeIndex] = newTotalProductionQuantity;
    setTotalProductionQuantities(newTotalProductionQuantities);
  };

  const handleStandardQuantityChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newQuantities = [...standardQuantities];
    newQuantities[index] = parseInt(event.target.value, 10) || 0;
    setStandardQuantities(newQuantities);
  };



  const calculateTotalAllocation = (sizeIndex: number) => {
    return tableData.reduce(
      (total, row) => {
        // Check if row and row.sizeQuantities are not null
        if (row && row.sizeQuantities) {
          // Check if sizeIndex is within the bounds of the sizeQuantities array
          if (sizeIndex < row.sizeQuantities.length) {
            return total + row.sizeQuantities[sizeIndex].quantity;
          }
        }
        return total;
      },
      0
    );
  };



  const calculateTotalStdQtySum = (): number => {
    return standardQuantities.reduce((total, currentQuantity) => total + (currentQuantity || 0), 0);
  };
  useEffect(() => {
    const newTotalStdQty = calculateTotalStdQtySum();
    setTotalStdQty(newTotalStdQty);

  }, [standardQuantities, tableData]);


  const calculateRowTotal = (rowIndex: number) => {
    return tableData[rowIndex].sizeQuantities.reduce((total, sizeData) => total + sizeData.quantity, 0);
  };

  const calculateTotalSizeQuantitiesSum = (): number => {
    return tableData.reduce((total, _rowData, rowIndex) => total + calculateRowTotal(rowIndex), 0);
  };


  const calculateOverstock = (sizeIndex: number) => {
    const totalAllocation = calculateTotalAllocation(sizeIndex);
    const totalProductionQuantity = totalProductionQuantities[sizeIndex] || 0;
    const result = Math.max(totalProductionQuantity - totalAllocation);
    return isNaN(result) ? 0 : result;
  };


  const reset = (skipSaveConfirmation = false) => {
    if (!skipSaveConfirmation) {
      const confirmReset = window.confirm("Do you want to save before resetting?");
      if (confirmReset) {
        onSave();
        return;
      }
    }

    
    setTableData([]);
    setTotalProductionQuantities([]);
    setStandardQuantities(new Array(13).fill(0));
    setTotalProductionSum(0);
    setCalculateClicked(false);
    setTotalStdQty(0);
    setOverstockStore(null);
    setStores(storeNames);
    setAllChecked(true);
  };
  useImperativeHandle(ref, () => ({
    reset
  }));





  return (
    <>

      <Header
        poNo={poNo}
        setPoNo={setPoNo}
        supplierName={supplierName}
        setSupplierName={setSupplierName}
        styleNo={styleNo}
        setStyleNo={setStyleNo}
        description={description}
        setDescription={setDescription}
        color={color}
        setColor={setColor}
        cost={cost}
        setCost={setCost}
        msrp={msrp}
        setMsrp={setMsrp}

        onSave={onSave}  // pass onSave as prop
      />
      <Container id='no-print'>
        <Grid gutter="md" justify="center" >

          <Col span={8}>


            <Grid.Col >

              <Text  ta="center" fz="lg" fw={600} component="label" htmlFor="size-input-field">
                Sizes:
              </Text>

              <Input
                type="text"
                id="size-input-field"
                name="size-input-field"
                placeholder="Enter size range"
                onChange={handleSizeChange}

              />
            </Grid.Col>



          </Col>
          <Group spacing="lg">
            <Col span={12}>


              <Grid.Col >
                <Flex justify="center" wrap="wrap" align="center" direction="row" rowGap="xs" columnGap="md">
                  <Checkbox
                    label="Check All"
                    checked={allChecked}
                    onChange={handleAllCheckedChange}
                  />




                  {storeNames.map((storeName) => (
                    <div key={storeName}>
                      <Checkbox
                        label={storeName}
                        checked={stores.includes(storeName)}
                        onChange={(e) => handleStoreChange(e, storeName)}
                      />
                    </div>
                  ))}


                </Flex>
              </Grid.Col>
            </Col>
          </Group>

        </Grid>
      </Container>
      <MantineProvider
        theme={{
          components: {
            Container: {
              defaultProps: {
                sizes: {
                  xs: 540,
                  sm: 720,
                  md: 960,
                  lg: 1140,
                  xl: 2340,
                },
              },
            },
          },
        }}
      >
        <Container style={{ marginTop: "20px" }} size="xl">

          <Grid>
            <Table id="table-to-print-1" className="table">
              <thead id='table-header'>
                <tr>
                  <th >Store</th>
                  {sizes.map((size) => (
                    <th key={size}>{size}</th>
                  ))}
                  <th>Total</th>
                  <th> STD QTY</th>
                </tr>
              </thead>
              <tbody style={{border:'1px solid #d0d0d0', borderRight:'1px solid #d0d0d0'}}>
                <tr>
                  <td style={{fontWeight: 'bold'}} >RCV QTY</td>
                  {sizes.map((_size, index) => (
                    <td key={`total-production-quantity-${index}`}  style={{borderLeft:'1px solid #d0d0d0'}}>
                      
                      <Input
                        type="number"
                        value={totalProductionQuantities[index] || 0}
                        onChange={(e) => handleTotalProductionQuantityChange(e, index)}
                        size="md" 
                        variant="unstyled"
                       style={{width: '100%'}}               
                      />
                    </td>
                  ))}
                  <td style={{borderRight:'1px solid #d0d0d0', borderLeft: '1px solid #d0d0d0'}}>
                    <Input type="number" value={totalProductionSum} readOnly style={{ width: "100%" }}  size='md' variant='unstyled'/>
                  </td>
                  <td />
                </tr>
                {tableData.map((row, rowIndex) => (
                  <tr key={row.storeName} >
                    <td style={{fontWeight: 'bold'}}>{row.storeName}</td>
                    {row.sizeQuantities.map((sizeData, sizeIndex) => (

                      <td key={sizeData.size} style={{borderLeft:'1px solid #d0d0d0'}}>
                        <Input
                          type="number"
                          value={sizeData.quantity}
                          onChange={(e) =>
                            handleQuantityChange(e, rowIndex, sizeIndex)
                          }
                          style={{ width: "100%" }}
                          size='md'
                          variant='unstyled'
                        />
                      </td>
                    ))}
                    <td style={{borderLeft:'1px solid #d0d0d0'}}>
                      <Input
                        type="number"
                        value={calculateRowTotal(rowIndex)}
                        readOnly
                        style={{ width: "100%" }}
                        size='md'
                        variant='unstyled'
                      />
                    </td>
                    <td style={{borderLeft:'1px solid #d0d0d0'}}>
                      <Input
                        type="number"
                        value={standardQuantities[rowIndex]}
                        onChange={(e) => handleStandardQuantityChange(e, rowIndex)}
                        placeholder="Enter standard quantity"
                        style={{ width: "100%" }}
                        variant='unstyled'
                        size='md'
                      />
                    </td>

                  </tr>
                ))}
                <tr style={{borderBottom:'1px solid #d0d0d0', borderTop:'1px solid #d0d0d0'}}>
                  <td  style={{fontWeight: 'bold'}}>Total allocation</td>
                  {sizes.map((_, index) => (
                    <td key={`total-allocation-${index}`} style={{borderLeft:'1px solid #d0d0d0'}}>
                     <Input type='number' value= {calculateTotalAllocation(index)}  style={{width: '100%'}} size='md' variant='unstyled'/>
                    </td>
                  ))}
                  <td style={{borderLeft:'1px solid #d0d0d0'}}> <Input type='number' value= {calculateTotalSizeQuantitiesSum()}  style={{width: '100%'}} size='md' variant='unstyled'/></td>
                  <td style={{borderLeft:'1px solid #d0d0d0'}}>  <Input type='number' value= {calculateTotalStdQtySum()}  style={{width: '100%'}} size='md' variant='unstyled'/></td>
                </tr>
                <tr>
                  <td  style={{fontWeight: 'bold'}}>Overstock</td>
                  {sizes.map((_, index) => (
                    <td key={`overstock-${index}`} style={{borderLeft:'1px solid #d0d0d0'}}>
                      <Input type='number' value={calculateOverstock(index)}  style={{width: '100%'}} size='md' variant='unstyled'/>
                    </td>

                  ))}
                  <td style={{borderLeft:'1px solid #d0d0d0', borderRight: '1px solid #d0d0d0'}}>
                   
                    <Input type='number' value={Math.max(totalProductionSum - calculateTotalSizeQuantitiesSum(), 0)}  style={{width: '100%'}} size='md' variant='unstyled'/> 
                  
                  </td>

                  

                </tr>
              </tbody>
            </Table>
          </Grid>
        </Container>
      </MantineProvider>
      <Container>
        
      </Container>

      <Center style={{ marginTop: "25px", marginBottom: "10px" }} >
        <Group>

          <Button onClick={handleCalculateClick}>Calculate</Button>
          <Button onClick={() => {
            const newTableData = allocateOverstockToStore(tableData, 'STEELES');
            setTableData(newTableData);
          }}>
            Send Overstock to STEELES
          </Button>

          <Button onClick={() => reset()}>Reset</Button>
          <Button onClick={onSave}>Save</Button>
         <Button onClick={downloadPDF}>PRINT</Button>

        </Group>

      </Center>

    </>
  );
};

export default forwardRef(Alloc);


