import { TextField, Button, Typography, InputAdornment } from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useDispatch } from "react-redux";
import MailIcon from '@mui/icons-material/Mail';
import LockIcon from '@mui/icons-material/Lock'

const Login = () => {
  //.log(process.env)
  const [formdata, setData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleChange(event) {
    setData({ ...formdata, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {

    event.preventDefault();

    //validations
    if (formdata.password.trim() === "") {
      toast.warning("Password cannot include only spaces");
    } 
    
    else {

      formdata.password = formdata.password.trim();

      if (formdata.password.length < 8) {
        toast.warning("Password length is less than 8");
      } 
      
      else {

        try {
          const url = `${import.meta.env.VITE_NODE_BASE_URL}/userapi/loginuser`;

          const headers = { "Content-Type": "application/json" };

          const response = await axios.post(url, formdata, { headers });

          const userdata = response.data.data;
          const {token,refreshtoken} = response.data
          
          console.log(token)
          console.log(refreshtoken) 
          sessionStorage.setItem("token", token);
          sessionStorage.setItem("refreshtoken",refreshtoken)

          dispatch({ type: "GIVE_DETAILS", payload: userdata.data });

          navigate("/dashboard");

        } catch (error) {

          

          const { status } = error.response;

          if (status === 503) 
          {
            navigate("/internalerror");
          } 
          else if (status === 404) 
          {
            toast.warning("User does not exist. Kindly register yourself.");
            navigate("/signup");
          } 
          else if (status === 401)
          {
            toast.warning("Wrong password");
          }
          else if(status===429)
          {
            toast.warning(error.response.data)
          }
        }
      }
    }
  }

  return (
    <div className="login-container">

      <form onSubmit={handleSubmit} className="login-form">

         

        <Typography varient="h7"  sx={{textAlign:'center',color:'black',mb:'10px'}}  ><strong>LOGIN</strong></Typography>

        <TextField
          label="Email"
          variant="outlined"
          type="email"
          fullWidth
          required
          name="email"
          value={formdata.email}
          onChange={handleChange}
          sx={{marginBottom:'20px'}}
          InputLabelProps={{
                sx: {
                  fontWeight: 'bold',
                  color: 'black',
                },
          }}
           InputProps={{
            sx:{fontWeight:'bold',color:'black'},
            startAdornment: (
              <InputAdornment position="start">
                <MailIcon />
              </InputAdornment>
            ),
           }}  
        />

        <TextField
          label="Password"
          variant="outlined"
          type="password"
          required
          fullWidth
          name="password"
          value={formdata.password}
          onChange={handleChange}
          sx={{marginBottom:'20px'}}
           InputLabelProps={{
                sx: {
                  fontWeight: 'bold',
                  color: 'black',
                },
          }}
          InputProps={{
           startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
           ),
      }}
         
        />

        <Button variant="contained" type="submit" sx={{width:'100%',marginTop:'10px'}}>
          Submit
        </Button>

        <Link to="/signup" className="signup-link">
          <strong>New user? Register here</strong>
        </Link>

      </form>
    </div>
  );
};

export default Login;
