import React from 'react';
import { Button } from '@mantine/core';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { IconDownload } from '@tabler/icons-react';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

interface SizeQuantity {
  size: string;
  quantity: number;
}

interface AllocationData {
  allocation_id: number;
  storeName: string[];
  style_no: string;
  supplierName: string;
  poNo: string;
  sizeQuantities: SizeQuantity[][];
}

const initialFilterState = {
  storeName: '',
  supplierName: '',
  styleNo: '',
  poNo: ''
};

interface PDFGeneratorProps {
  data: AllocationData[];
  filter: typeof initialFilterState;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ data, filter }) => {
  const generatePDF = () => {
    let docDefinition = {
      content: [
        {
          text: `Supplier Name: ${filter.supplierName}`,
          fontSize: 16,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 8]
        },
        {
          text: `PO No: ${filter.poNo}`,
          fontSize: 16,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 8]
        },
        {
          text: `Store Name: ${filter.storeName}`,
          fontSize: 16,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 16]
        },
        {
          table: {
            widths: ['*', '*', '*', '*'],
            body: buildTableBody(data)
          },
          layout: {
            hLineColor: () => '#ccc',
            vLineColor: () => '#ccc',
            hLineWidth: () => 1,
            vLineWidth: () => 1
          }
        }
      ],
      defaultStyle: {
        fontSize: 12
      }
    };

    pdfMake.createPdf(docDefinition as TDocumentDefinitions).open();
  };

  const buildTableBody = (data: AllocationData[]) => {
    let body = [];
  
    body.push(["Style Number", "Size", "Quantity", "Total"]);
  
    data
      .filter(row => 
        (!filter.supplierName || row.supplierName.toLowerCase().includes(filter.supplierName.toLowerCase())) &&
        (!filter.poNo || row.poNo.toLowerCase().includes(filter.poNo.toLowerCase())))
      .forEach(row => {
        // Apply the filter here
        row.storeName
          .filter(storeName => (!filter.storeName || storeName.toLowerCase().includes(filter.storeName.toLowerCase())))
          .forEach((storeName, i) => {
            const total = row.sizeQuantities[i].reduce((acc, curr) => acc + curr.quantity, 0);
            row.sizeQuantities[i].forEach((sq, j) => {
              let dataRow = [];
              dataRow.push(j === 0 ? row.style_no : "");
              dataRow.push(sq.size);
              dataRow.push(sq.quantity);
              dataRow.push(j === 0 ? total : "");
              body.push(dataRow);
            });
          });
      });
    return body;
  };

  return (
    <Button onClick={generatePDF} leftIcon={<IconDownload/>}/>
  );
};

export default PDFGenerator;
