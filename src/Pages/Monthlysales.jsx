import { useEffect, useState, useMemo } from "react";
import {
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import DescriptionIcon from '@mui/icons-material/Description'
import ListIcon from '@mui/icons-material/List'

const MonthlySales = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(2);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [totalElements, setTotalElements] = useState(0);

  const { userdata } = useSelector((state) => state);
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBillItems, setSelectedBillItems] = useState([]);

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = 2010; y <= currentYear; y++) {
    years.push(y);
  }

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_NODE_BASE_URL}/billapi/monthly-sales-report/${userdata.id}`,
        {
          params: {
            month,
            year,
            page,
            size: rowsPerPage,
          },
          headers: { Authorization: token },
        }
      );
      const resData = res.data.data.data;
      console.log(resData)
      setData(resData.content);
      setTotalElements(resData.totalElements);
    } catch (error) {
      const { status } = error.response;
      if (status === 403) {
        toast.warning("Token expired, kindly relogin.");
        navigate("/login");
      }

      if (status === 503) {
        navigate("/internalerror");
      }

      if (status === 400) {
        toast.warning("bad request");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month, year, page, rowsPerPage]);

  const totalPageAmount = useMemo(() => {
    return data.reduce((sum, bill) => sum + bill.totalamount, 0);
  }, [data]);


  //generate pdf
  const generatepdf = (bill) => {
  console.log(bill);
  const doc = new jsPDF();

  // 1. Shop Name (Title)
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.setFont("helvetica", "bold");
  doc.text(userdata.shopname, 105, 20, { align: "center" });

  // 2. Subheading
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("E-Bill Receipt", 105, 30, { align: "center" });

  // 3. Customer & Bill Info
  const detailsY = 40;
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Customer: ${bill.customername}`, 14, detailsY);
  doc.text(`Bill ID: ${bill.billid}`, 14, detailsY + 6);
  doc.text(`Date: ${new Date(bill.date).toLocaleDateString()}`, 14, detailsY + 12);

  // Optional: Horizontal line
  doc.line(14, detailsY + 18, 195, detailsY + 18);

  // 4. Table - Items
  const tableColumn = ["Item Name", "Quantity", "Price/Unit", "Subtotal"];

  const tableRows = bill.billitems.map((item) => [
    item.name,
    item.quantity.toString(),
    item.priceperunit.toFixed(2),
    item.subtotal.toFixed(2),
  ]);

  // const Total=bill.billitems.reduce((sum,item)=>sum+item.subtotal,0)
  // console.log(Total.toFixed(2))

  autoTable(doc, {
    startY: detailsY + 22,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    headStyles: { fillColor: [63, 81, 181] },
    styles: {
      fontSize: 11,
      cellPadding: 3,
      overflow: "linebreak",
      halign: "center",
    },
  });

  // 5. Tax & Total
  const afterTableY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`GST(10%):   ${bill.taxamount.toFixed(2)}`, 14, afterTableY);
  doc.text(`Total:   ${bill.totalamount.toFixed(2)}`, 14, afterTableY + 6);

  // 6. Save
  doc.save(`bill_${bill.billid}.pdf`);
};


  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Monthly Sales Summary
      </Typography>

      {/* Filters */}
      <Box className="filters-container">
        <FormControl>
          <InputLabel id="month-label">Month</InputLabel>
          <Select
            labelId="month-label"
            value={month}
            label="Month"
            onChange={(e) => {
              setMonth(e.target.value);
              setPage(0);
            }}
          >
            {months.map((m) => (
              <MenuItem key={m.value} value={m.value}>
                {m.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel id="year-label">Year</InputLabel>
          <Select
            labelId="year-label"
            value={year}
            label="Year"
            onChange={(e) => {
              setYear(e.target.value);
              setPage(0);
            }}
          >
            {years.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <TableContainer className="sales-table-container">
            <Table className="sales-table">
              <TableHead>
                <TableRow>
                  <TableCell>Bill ID</TableCell>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Tax Amount</TableCell>
                  <TableCell>Bill Items</TableCell>
                  <TableCell>Download Bill</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      No records found for this month/year.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((bill) => (
                    <TableRow key={bill.billid}>
                      <TableCell>{bill.billid}</TableCell>
                      <TableCell>{bill.customername}</TableCell>
                      <TableCell>{bill.date}</TableCell>
                      <TableCell>Rs:{bill.totalamount}</TableCell>
                      <TableCell>Rs:{bill.taxamount}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          endIcon={<ListIcon/>}
                          onClick={() => {
                            setSelectedBillItems(bill.billitems);
                            setDialogOpen(true);
                          }}
                          
                        >
                          Show Items
                        </Button>
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          endIcon={<DescriptionIcon/>}
                          onClick={() => generatepdf(bill)}
                        >
                          E-bill
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2, textAlign: "right", pr: 2 }}>
            <Typography variant="subtitle1">
              Page Total Amount: <strong>Rs{totalPageAmount.toFixed(2)}</strong>
            </Typography>
          </Box>

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
        </>
      )}

      {/* Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Bill Items</DialogTitle>
        <DialogContent>
          {selectedBillItems.length === 0 ? (
            <Typography>No items to display.</Typography>
          ) : (
            <ul style={{ paddingLeft: 16 }}>
              {selectedBillItems.map((item) => (
                <li key={item.billitemid}>
                  <strong>{item.name}</strong> — Qty: {item.quantity},
                  Price/unit: {item.priceperunit}, Subtotal: {item.subtotal}
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default MonthlySales;
