import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface MatchParams {
  id: string;
}

interface SizeQuantity {
  size: string;
  quantity: number;
}

interface StoreData {
  store_id: number;
  storeName: string;
  sizeQuantities: SizeQuantity[];
  total: number;
  supplier_name: string;
  style_no: string;
}

const StorePage: React.FC = () => {
  const { id } = useParams<Record<string, string>>();
  const storeId = id ? parseInt(id, 10) : null;

  const [storeData, setStoreData] = useState<StoreData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`http://localhost:5000/api/store_data/${storeId}`);
      const data = await response.json();
      
      setStoreData(data);
    };

    if (storeId) {
      fetchData();
    }
  }, [storeId]); // fetch new data when the storeId changes

  if (!storeData) {
    return <div>Loading...</div>;
  }

  // Display store name, supplier name, style no. on top
  return (
    <>
      <h1>{storeData.storeName}</h1>
      <h2>Supplier: {storeData.supplier_name}</h2>
      <h2>Style No: {storeData.style_no}</h2>

      {/* Render the table with the size and quantity data */}
      <table>
        <thead>
          <tr>
            <th>Size</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {storeData.sizeQuantities.map((sq, index) => (
            <tr key={index}>
              <td>{sq.size}</td>
              <td>{sq.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default StorePage;
