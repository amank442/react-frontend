import { useEffect, useState } from "react";
import axios from "axios";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import DescriptionIcon from '@mui/icons-material/Description'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteIcon from '@mui/icons-material/Delete';

const Billing = () => {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState({});
  const [quantities, setQuantities] = useState({});
  const [customername, setCustomerName] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [billdata, setBillData] = useState({});
  const navigate = useNavigate();
  const { userdata } = useSelector((state) => state);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const url = `${import.meta.env.VITE_NODE_BASE_URL}/userapi/userallitems/${userdata.id}`;
        const res = await axios.get(url, {
          headers: { Authorization: token },
        });
        setItems(res.data.data.data);
      } catch (err) {

        const { status } = err.response

        if (status === 403) navigate("/login");

        else if (status === 503) navigate("/internalerror");

        else toast.error("Failed to load items.");
      }
    };

    fetchItems();
  }, [billdata]);

  const handleQuantityChange = (itemId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: parseInt(value) || 0,
    }));
  };

  const handleAddCart = (item) => {

    const quantity = quantities[item.itemid];
     console.log(cart)

    if (!quantity || quantity <= 0) {
      toast.warning("Please enter a valid quantity.");
      return;
    }

    //first check wheather the adding item exist or not
    if(cart.hasOwnProperty(item.itemid))
    { 
        console.log("inside hasownpropety")
       //now check wheather the quantity is same or not 
       if(Object.keys(cart).length!==0 && cart[item.itemid].quantity===quantity)
       {
           toast.warning(item.name+" with the given quantity exist already")
              return
       }
    }
   

    setCart((prevCart) => ({
      ...prevCart,
      [item.itemid]: {
        itemid: item.itemid,
        name: item.name,
        price: item.price,
        quantity,
      },
    }));

    toast.success(`${item.name} added to cart.`);
  };

  const handleDeleteCartItem = (itemId) => {
    setCart((prevCart) => {
      const updatedCart = { ...prevCart };
      delete updatedCart[itemId];
      return updatedCart;
    });
  };

  const cartItems = Object.values(cart).filter((item) => item.quantity > 0);
  
  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleOpenDialog = () => {
    if (cartItems.length === 0) {
      toast.warning("Your cart is empty.");
      return;
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCustomerName("");
  };

  const handleConfirmBilling = async () => {

    //validations 
    if (customername.trim() === "" || customername.trim().length < 4) {
      toast.warning("Customer name should be between 4 and 15 characters.");
      return;
    }

    const billitemdtos = cartItems.map((item) => ({
      itemid: item.itemid,
      name: item.name,
      quantity: item.quantity,
      priceperunit: item.price,
      subtotal: item.price * item.quantity,
    }));

    const billdetails = { customername, billitemdtos };

    try {
      const url = `${import.meta.env.VITE_NODE_BASE_URL}/billapi/createbill/${userdata.id}`;

      const response = await axios.post(url, billdetails, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      setBillData(response.data.data.data);
      toast.success("Bill created successfully!");
      setCart({});
      setQuantities({});
      setCustomerName("");
      setOpenDialog(false);
    } catch (error) {

      const { status } = error.response 

      if (status === 403) {
        toast.warning("Token expired plz Login..");
        navigate("/login");
      } else if (status === 409) {
        toast.warning(error.response.data.data.message);
      } else if (status === 503) {
        navigate("/internalerror");
      } else {
        toast.error("Something went wrong while creating the bill.");
      }
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(userdata.shopname, 105, 20, { align: "center" });
    doc.setFontSize(14);
    doc.text("E-Bill Receipt", 105, 30, { align: "center" });

    const detailsY = 40;
    doc.setFontSize(12);
    doc.text(`Customer: ${billdata.customername}`, 14, detailsY);
    doc.text(`Bill ID: ${billdata.billid}`, 14, detailsY + 6);
    doc.text(`Date: ${billdata.date}`, 14, detailsY + 12);

    const tableColumn = [
      "Item Name",
      "Quantity",
      "Price/Unit",
      "Subtotal",
    ];

    const tableRows = billdata.billitems.map((item) => [
      item.name,
      item.quantity,
      item.priceperunit.toFixed(2),
      item.subtotal.toFixed(2),
    ]);

    autoTable(doc, {
      startY: detailsY + 20,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
    });

    const afterTableY = doc.lastAutoTable.finalY + 10;
    doc.text(`GST(10%): ${billdata.taxamount.toFixed(2)}`, 14, afterTableY);
    doc.text(`Total: ${billdata.totalamount.toFixed(2)}`, 14, afterTableY + 6);

    doc.save(`bill_${billdata.billid}.pdf`);

    setBillData({});
  };

  return (
    <Container className="billing-container" sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {items.map((item) => (

          item.quantityavailable>0 && (

          <Grid item xs={12} sm={6} md={4} key={item.itemid}>
            <Card className="billing-card">
              <CardContent>
                <Typography variant="h6">{item.name}</Typography>
                <Typography>Price: ₹{item.price.toFixed(2)}</Typography>
                <Typography>Available: {item.quantityavailable}</Typography>
                <TextField
                  type="number"
                  label="Quantity"
                  fullWidth
                  size="small"
                  value={quantities[item.itemid] || ""}
                  onChange={(e) =>
                    handleQuantityChange(item.itemid, e.target.value)
                  }
                  margin="normal"
                  disabled={item.quantityavailable == 0 ? true : false}
                  inputProps={{ min: 0 }}
                />
                <Button
                  variant="contained"
                  endIcon={<ShoppingCartIcon/>}
                  color="primary"
                  onClick={() => handleAddCart(item)}
                  disabled={item.quantityavailable == 0 ? true : false}
                  fullWidth
                >
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          </Grid>)
        ))}
      </Grid>

      {cartItems.length > 0 && (
        <div className="cart-section" style={{ marginTop: "2rem" }}>
          <Typography variant="h5" gutterBottom>
            🛒 Cart Summary
          </Typography>

          <TableContainer component={Paper} elevation={3}>
            <Table aria-label="cart table">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Item</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Quantity</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Price (₹)</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Subtotal (₹)</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Action</strong>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {cartItems.map((item) => (
                  <TableRow key={item.itemid}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">{item.price}</TableCell>
                    <TableCell align="right">
                      {(item.price * item.quantity).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        endIcon={<DeleteIcon/>}
                        color="error"
                        size="small"
                        onClick={() => handleDeleteCartItem(item.itemid)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "1rem",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">
              Total: ₹{totalAmount.toFixed(2)}
            </Typography>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon/>}
              color="secondary"
              onClick={handleOpenDialog}
            >
              Proceed to Billing
            </Button>
          </div>
        </div>
      )}

      {Object.keys(billdata).length > 0 && (

        <Box sx={{display:'flex',justifyContent:'center'}}>
                  <Button
                    variant="contained"
                    endIcon={<DescriptionIcon/>}
                    color="success"
                    className="download-btn"
                    sx={{ mt: 3}}
                    onClick={generatePDF}
                   >
                       Download E-Bill PDF
                  </Button>
        </Box>
      
      )}


       {/* Enter the customer name */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Enter Customer Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Customer Name"
            fullWidth
            value={customername}
            sx={{mt:3}}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="error">
            Cancel
          </Button>
          <Button onClick={handleConfirmBilling} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
export default Billing;
