import React, { useEffect, useMemo, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, TablePagination, Typography, CircularProgress,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  InputAdornment
} from "@mui/material";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';



const Inventory = () => {
  const [items, setItems] = useState([]);
  const[filterdata,setFilter]= useState([])
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(2);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editQuantity, setEditQuantity] = useState("");

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [search,setSearch]= useState('')

  const token = sessionStorage.getItem("token");

  const { userdata } = useSelector((state) => state);
 
  const navigate = useNavigate();

  const fetchItems = async (page, size) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_NODE_BASE_URL}/itemapi/getitems/${userdata.id}`,
        {
          params: { page, size },
          headers: { Authorization: token },
        }
      );
      const result = res.data.data.data;
      console.log(result)
      setItems(result.content);
      setFilter(result.content)
      setTotalElements(result.totalElements);

    } catch (error) {

      const { status } = error.response

      if (status === 403) {
        toast.warning("Token expired. Kindly login again.");
        navigate("/login");
      }

      if(status===503)
      {
        navigate('/internalerror')
      }
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleEdit = (item) => {
    setEditItem(item);
    setEditPrice(item.price);
    setEditQuantity(item.quantityavailable);
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {


     console.log(editPrice)
     console.log(editQuantity)

    //validations
    if(editPrice<0 || editPrice==='0')
    {
      toast.warning("price cannot be negative or zero")
      return
    }
    if(editQuantity<0)
    {
      toast.warning("quantity cannot be negative")
      return
    }
    
    try {
      await axios.patch(
        `${import.meta.env.VITE_NODE_BASE_URL}/itemapi/updateitem`,
        {
          itemid: editItem.itemid,
          price: editPrice,
          quantity: editQuantity,
        },
        {
          headers: { Authorization: token, "Content-Type": "application/json",},
        }
      );

      toast.success("Item updated successfully");
      setEditDialogOpen(false);
      fetchItems(page, rowsPerPage);
    } catch (error) 
    {
      const { status } = error.response
      if (status === 403) {
        toast.warning("Token expired. Kindly login again.");
        navigate("/login");
      } 

      if(status===503)
      {
        navigate('/internalerror')
      }

      if(status===400)
      {
             toast.warning("bad request")
      }
      
        
    }
  };

  //Delete a item
  const handleDelete = async (itemId) => {

    if (!window.confirm("Are you sure you want to delete this item?")) return;

    //calling the api
    try {

      await axios.delete(`${import.meta.env.VITE_NODE_BASE_URL}/itemapi/deleteitem/${itemId}`, {

        headers: { Authorization: token },
      });
      toast.success("Item deleted successfully");

      fetchItems(page, rowsPerPage);

    } catch (error) 
    {
      const { status } = error.response 

      if (status === 403) {
        toast.warning("Token expired. Kindly login again.");
        navigate("/login");
      }
      if(status===503)
      {
        navigate('/internalerror')
      }

      if(status===400)
      {
        toast.warning("bad request")
      }
    }
  }

  // Add a item
  const handleAddItem = async () => {
    
    console.log(newName)
    console.log(newPrice)
    console.log(newQuantity)
    console.log(newCategory)
    
    //validations
    if(newName.trim()==='')
    {
       toast.warning("item name cannot contain only spaces")
       return
    }


    console.log(newName.trim().length)
    if(newName.trim().length<4 || newName.trim().length>15)
    {
          toast.warning("item name should be btw 4-15")
          return
    }
    if(newPrice<0 || newPrice==='0')
    {
      toast.warning("price cannot be negative or zero")
      return
    }
    if(newQuantity<0)
    {
      toast.warning("quantity cannot be negative either 0 or greater than zero")
      return;
    }

    //calling the api
    try {
      await axios.post(
        
        `${import.meta.env.VITE_NODE_BASE_URL}/itemapi/additem/${userdata.id}`,
        {
          name: newName,
          price: Number(newPrice).toFixed(2),
          category: newCategory,
          quantityavailable: newQuantity,
        },
        {
          headers: { Authorization: token,"Content-Type": "application/json" },
        }
      );

      toast.success("Item added successfully");
      setAddDialogOpen(false);
      setNewName("");
      setNewCategory("");
      setNewPrice("");
      setNewQuantity("");
      fetchItems(page, rowsPerPage);

    } catch (error) {

      const { status } = error.response

      if (status === 403) {
        toast.warning("Token expired. Kindly login again.");
        navigate("/login");
      } 
      if(status===400)
      {
        toast.warning("validation error")
      }
      if(status===503)
      {
        navigate('/internalerror')
      }
    }
  }
  console.log("hi dialogue")

  //Search a item per page
  function filtereitems(searchitem)
  {

    if(searchitem.trim()==='')
    {
      setFilter(items)
      return
    }
    
    console.log(typeof(searchitem))
    setFilter(()=>items.filter((item)=>item.name.toLowerCase().includes(searchitem.toLowerCase())))
    console.log("inside filtere")
    console.log(filterdata)
  
  }
  
  useMemo(()=>filtereitems(search),[search])



  return (
    <Paper sx={{ p: 3, mt: 4 }}>

       {/* Search item textfeild */}
      <TextField
      label="Search Item"
      variant="outlined"
      fullWidth
      value={search}
      onChange={(e)=>setSearch(e.target.value)}
      />
      <Typography variant="h6" gutterBottom>Inventory</Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell><strong>Price</strong></TableCell>
                  <TableCell><strong>Quantity</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
             <TableBody>
                {filterdata.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No items available
                    </TableCell>
                  </TableRow>
                ) : (
                  filterdata.map((item) => (
                    <TableRow key={item.itemid}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.price}</TableCell>
                      <TableCell>{item.quantityavailable}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          endIcon={<EditIcon/>}
                          size="small"
                          color="success"
                          onClick={() => handleEdit(item)}
                          sx={{ mr: 1 }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="contained"
                          endIcon={<DeleteIcon/>}
                          size="small"
                          color="error"
                          onClick={() => handleDelete(item.itemid)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>

            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalElements}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[2, 5, 10]}
          />

          {/*Add Item Button */}
          <Button variant="contained" color="success" onClick={() => setAddDialogOpen(true)} sx={{ mt: 2 }}>
            Add Item
          </Button>
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          <TextField label="Price" type="number" fullWidth margin="dense" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
          <TextField label="Quantity" type="number" fullWidth margin="dense" value={editQuantity} onChange={(e) => setEditQuantity(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" color="primary">Update</Button>
        </DialogActions>
      </Dialog>

      {/*Add Item Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth margin="dense" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <TextField label="Category" fullWidth margin="dense" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
          <TextField label="Price" type="number" fullWidth margin="dense" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
          <TextField label="Quantity Available" type="number" fullWidth margin="dense" value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
                                 setAddDialogOpen(false)
                                 setNewName("")
                                 setNewCategory("")
                                 setNewPrice("")
                                 setNewQuantity("")
                                }
          }>Cancel</Button>
          <Button onClick={handleAddItem} variant="contained" color="success">Add</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Inventory;
