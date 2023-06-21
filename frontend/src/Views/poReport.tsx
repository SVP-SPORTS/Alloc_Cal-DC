import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

interface ReceivedQty{
    size: string;
    quantity: number;
  }
  
  interface AllocationData {
    style_no: string;
    supplierName: string;
    receivedQty: ReceivedQty[];
    total: number;
    totalAllocationPerSize: number[];
    overstockPerSize: number[];
    poNo: string;
    styleQty_id: number;
  }

  

  const createPdf = (data: AllocationData[], filter: any) => {
    const transformedData = data.map((allocation) => {
      return allocation.receivedQty.map((rq, rqIndex) => [
        rqIndex === 0 ? allocation.style_no : '',
        rqIndex === 0 ? allocation.total.toString() : '',
        rq.size,
        rq.quantity.toString(),
        allocation.totalAllocationPerSize[rqIndex].toString(),
        allocation.overstockPerSize[rqIndex].toString()
      ]);
    }).flat();
  
    const documentDefinition: TDocumentDefinitions = {
      content: [
        {
          text: `Supplier: ${filter.supplierName} | PO No: ${filter.poNo}`,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*', '*'],
            body: [
              ['Style No',  'Total', 'Size', 'RCV Quantity', 'Total Allocation', 'Overstock'],
              ...transformedData,
            ],
          },
        },
      ],
    } as TDocumentDefinitions;
  
    pdfMake.createPdf(documentDefinition).open();
  };

export default createPdf;