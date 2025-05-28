import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton,
  Drawer, List, ListItem, ListItemText, useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';

const Dashboard = () => {
  const { userdata } = useSelector((state) => state);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {

    //remove every key 
    sessionStorage.clear();
    
    toast.success("Successfully logged out");
    navigate('/login');
  };

  const menuItems = [
    { label: 'Inventory', path: 'inventory' },
    { label: 'Billing', path: 'billing' },
    { label: 'Monthly Sales', path: 'monthly-sales' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false); // Close drawer on navigation
  };

  return (
    <Box>
      <AppBar position="sticky" sx={{ backgroundColor: 'black' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
         
          {isMobile ? (
            <>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => setDrawerOpen(true)}
              >
                <MenuIcon />
              </IconButton>

              <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Box sx={{ width: 200 }} role="presentation">
                  <List>
                    {menuItems.map((item) => (
                      <ListItem button key={item.label} onClick={() => handleNavigation(item.path)}>
                        <ListItemText primary={item.label} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Drawer>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {menuItems.map((item) => (
                <Button key={item.label} color="inherit" onClick={() => handleNavigation(item.path)}>
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>

        </Toolbar>
      </AppBar>

      
      <Box sx={{ p: 3 }}>

        
        <Typography variant="h4" 
        sx={{textAlign:'center',backgroundImage: 'linear-gradient(20deg, #ff0000,rgb(134, 0, 128),rgb(6, 7, 6))',
        backgroundRepeat:'repeat',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent', 
        MozBackgroundClip: 'text',
        MozTextFillColor: 'transparent' }}>

          WELCOME, TO {userdata.shopname.toUpperCase()}
        </Typography>
      </Box>

      <Outlet />
    </Box>
  );
};

export default Dashboard;
