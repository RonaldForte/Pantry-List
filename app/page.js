'use client';
import { useState, useEffect } from 'react';
import { firestore } from '@/firebase';
import { Box, Modal, Typography, Stack, TextField, Button } from '@mui/material';
import { collection, deleteDoc, doc, getDocs, getDoc, setDoc } from 'firebase/firestore';
import PieChartComponent from './PieChartComponent';

export default function Home() {
  const [allInventory, setAllInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAllInventory = async () => {
    try {
      const snapshot = await getDocs(collection(firestore, 'inventory'));
      const inventoryList = snapshot.docs.map(doc => ({
        name: doc.id,
        ...doc.data(),
      }));
      setAllInventory(inventoryList);
      setFilteredInventory(inventoryList);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const filterInventory = term => {
    setFilteredInventory(
      term
        ? allInventory.filter(item =>
            item.name.toLowerCase().includes(term.toLowerCase())
          )
        : allInventory
    );
  };

  const updateItemQuantity = async (item, increment) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);
      const newQuantity = docSnap.exists() ? docSnap.data().quantity + increment : 1;

      if (newQuantity === 0) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: newQuantity });
      }

      await fetchAllInventory();
    } catch (error) {
      console.error(`Error ${increment > 0 ? 'adding' : 'removing'} item:`, error);
    }
  };

  useEffect(() => {
    fetchAllInventory();
  }, []);

  useEffect(() => {
    filterInventory(searchTerm);
  }, [searchTerm, allInventory]);

  const pieChartData = filteredInventory.reduce((acc, { name, quantity }) => {
    acc[name] = quantity;
    return acc;
  }, {});

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      p={2}
    >
      <Box width="100%" padding={2} display="flex" alignItems="center" justifyContent="center" mb={2}>
        <Typography variant="h4" color="#fff">Food Pantry</Typography>
      </Box>

      <Box width="100%" display="flex" flexDirection="row" justifyContent="center" gap={2}>
        <Box width="40%" height="100%" display="flex" flexDirection="column">
          <Box border="1px solid #333" width="100%" height="100%" display="flex" flexDirection="column">
            <Box height="60px" display="flex" alignItems="center" justifyContent="center" borderBottom="1px solid #ddd" bgcolor="#fff">
              <Typography variant="h6" color="#000">Inventory Items</Typography>
            </Box>
            <Stack height="calc(100% - 60px - 50px)" spacing={0} overflow="auto">
              {filteredInventory.map(({ name, quantity }) => (
                <Box
                  key={name}
                  width="100%"
                  minHeight="60px"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  bgcolor="#FDF4DC"
                  padding={2}
                  borderBottom="1px solid #ddd"
                >
                  <Typography variant="body2" color="#000" textAlign="center" sx={{ flex: 1 }}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography variant="body2" color="#000" textAlign="center" sx={{ flex: 0, minWidth: '40px' }}>
                    {quantity}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button variant="contained" size="small" onClick={() => updateItemQuantity(name, 1)}>
                      +
                    </Button>
                    <Button variant="contained" size="small" onClick={() => updateItemQuantity(name, -1)}>
                      -
                    </Button>
                  </Stack>
                </Box>
              ))}
            </Stack>
            <Box position="sticky" bottom={0} width="100%" display="flex" justifyContent="center" bgcolor="white" borderTop="1px solid #ddd" p={1}>
              <Button
                variant="contained"
                onClick={() => setOpen(true)}
                sx={{ fontSize: '0.75rem', padding: '4px 8px' }}
              >
                Add New Item
              </Button>
            </Box>
          </Box>
        </Box>

        <Box width="35%" height="100%" display="flex" flexDirection="column" alignItems="center" gap={2} p={2}>
          <TextField
            variant="outlined"
            placeholder="Search items in pantry"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            sx={{
              width: '100%',
              backgroundColor: '#f5f5f5',
              borderRadius: '20px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                '& fieldset': {
                  borderColor: '#ccc',
                },
                '&:hover fieldset': {
                  borderColor: '#888',
                },
              },
            }}
          />
          <Box width="100%" height="300px" display="flex" justifyContent="center" alignItems="center" mt={4}>
            <PieChartComponent data={pieChartData} />
          </Box>
        </Box>
      </Box>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box width={300} p={3} bgcolor="white" borderRadius={2} boxShadow={24} m="auto" mt={5}>
          <Typography variant="h6" mb={2}>Add New Item</Typography>
          <TextField
            variant="outlined"
            label="Item Name"
            fullWidth
            value={itemName}
            onChange={e => setItemName(e.target.value)}
          />
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              onClick={() => {
                if (itemName) {
                  updateItemQuantity(itemName, 1);
                  setItemName('');
                  setOpen(false);
                }
              }}
            >
              Add
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}