import React, { useState } from 'react';
import axios from 'axios';

interface StyleData {
  description: string;
  color: string;
  cost: string;
  msrp: string;
  style_no: string;
}

interface StyleEditFormProps {
  style: StyleData;
}

const StyleEditForm: React.FC<StyleEditFormProps> = ({ style }) => {
  const [description, setDescription] = useState<string>(style.description);
  //const [style_no, setStyle_no] = useState<String>(style.style_no);
  const [color, setColor] = useState<string>(style.color);
  const [cost, setCost] = useState<string>(style.cost);
  const [msrp, setMsrp] = useState<string>(style.msrp);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const updatedStyle = {
      description,
      color,
      cost,
      msrp
    };

    try {
      const response = await axios.put(`http://localhost:5000/api/styles/update/${style.style_no}`, updatedStyle);
      console.log(response.data);
    } catch (error) {
      console.error('Error updating style:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
      <input value={color} onChange={e => setColor(e.target.value)} placeholder="Color" />
      <input value={cost} onChange={e => setCost(e.target.value)} placeholder="Cost" />
      <input value={msrp} onChange={e => setMsrp(e.target.value)} placeholder="MSRP" />
      <button type="submit">Update Style</button>
    </form>
  );
};

export default StyleEditForm;
