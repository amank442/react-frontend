import { Button, InputAdornment, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import LockIcon from '@mui/icons-material/Lock'
import MailIcon from '@mui/icons-material/Mail';
import StoreIcon from '@mui/icons-material/Store'; 

const Signup = () => {

  const [formdata, setData] = useState({
    username: '',
    password: '',
    email: '',
    shopname: ''
  });

  const navigate = useNavigate();

  function handleChange(event) {
    setData({ ...formdata, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {

    event.preventDefault();

    // validations
    if (formdata.username.trim() === '') {
      toast.warning("username should not contain only spaces");
      return;
    }

    if (formdata.password.trim() === '') {
      toast.warning("password should not contain only spaces");
      return;
    }

    if (formdata.shopname.trim() === '') {
      toast.warning("shopname should not contain only spaces");
      return;
    }

    if (formdata.username.trim().length < 4 || formdata.username.trim().length > 15) {
      toast.warning("Username should be between range 4-15");
      return;
    }


     if (formdata.password.trim().length < 8) {
      toast.warning("password should minimum length of 8 ");
      return;
    }

    if (formdata.shopname.trim().length < 8 || formdata.shopname.trim().length > 25) {
      toast.warning("Shopname should be between range 8-25 ");
      return;
    }
   

    try {
      const url = `${import.meta.env.REACT_APP_NODE_BASE_URL}/userapi/createuser`;

      const headers = { "Content-Type": "application/json" };

      const response = await axios.post(url, formdata, { headers });

      console.log(response) 

      toast.success("Account created successfully..");

      navigate('/login');

    } catch (error) {

      const { status } = error.response;

      if (status === 409) {
        toast.warning("account already exist with this email");
      }
      else if (status === 503) {
        navigate('/internalerror');
      }
      else if(status===400)
      {
        toast.warning("Bad Request")
      }
      else if(status===429)
      {
        toast.error(error.response.data)
      }
    }
  }

  return (
    <div className="signup-container">
      
      <form onSubmit={handleSubmit} className="signup-form">


         <Typography varient="h7"  sx={{textAlign:'center',color:'black',mb:'10px'}}  ><strong>SIGNUP</strong></Typography>
        <TextField
          label="Username"
          variant="outlined"
          type="text"
          fullWidth
          required
          name="username"
          value={formdata.username}
          onChange={handleChange}
          sx={{ mb: 3 }}
          InputLabelProps={{
                sx: {
                  fontWeight: 'bold',
                  color: 'black',
                },
          }}
          InputProps={{
            sx:{fontWeight:'bold'},
             startAdornment: (
              <InputAdornment position="start">
                <AccountCircleIcon />
              </InputAdornment>
            ),
         }}
        />

        <TextField
          label="Password"
          variant="outlined"
          type="password"
          fullWidth
          required
          name="password"
          value={formdata.password}
          onChange={handleChange}
          sx={{ mb: 3 }}
          InputLabelProps={{
                sx: {
                  fontWeight: 'bold',
                  color: 'black',
                },
          }}
          InputProps={{
             sx:{fontWeight:'bold'},
           startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
           ),
         }}
        />

        <TextField
          label="Email"
          variant="outlined"
          type="email"
          fullWidth
          required
          name="email"
          value={formdata.email}
          onChange={handleChange}
          sx={{ mb: 3 }}
          InputLabelProps={{
                sx: {
                  fontWeight: 'bold',
                  color: 'black',
                },
          }}
          InputProps={{
             sx:{fontWeight:'bold'},
           startAdornment: (
                <InputAdornment position="start">
                  <MailIcon />
                </InputAdornment>
           ),
         }}
        />

        <TextField
          label="Shopname"
          variant="outlined"
          type="text"
          fullWidth
          required
          name="shopname"
          value={formdata.shopname}
          onChange={handleChange}
          sx={{ mb: 3 }}
          InputLabelProps={{
                sx: {
                  fontWeight: 'bold',
                  color: 'black',
                },
          }}
           InputProps={{
             sx:{fontWeight:'bold'},
            startAdornment: (
              <InputAdornment position="start">
                <StoreIcon />
              </InputAdornment>
            ),
          }}
        />

        <Button variant="contained" type="submit" sx={{ width: '100%', mt: 1 }}>
          Submit
        </Button>

        <Link to="/login" className="signup-link">
          <strong>Already an user</strong>
        </Link>

      </form>

    </div>
  );
};

export default Signup;
