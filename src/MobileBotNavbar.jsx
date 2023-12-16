// SimpleBottomNavigation.js

import * as React from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Grid4x4Icon from '@mui/icons-material/Grid4x4';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useNavigate, useLocation } from 'react-router-dom';


export default function SimpleBottomNavigation() {
  const [value, setValue] = React.useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    // Map the current route to the corresponding index
    const routes = ['/', '/post', '/remarks', '/doto'];
    const currentIndex = routes.indexOf(location.pathname);
    
    // Update the value if it's different from the current index
    if (currentIndex !== -1 && currentIndex !== value) {
      setValue(currentIndex);
    }
  }, [location.pathname, value]);

  const handleNavigation = (event, newValue) => {
    setValue(newValue);
    const routes = ['/', '/post', '/remarks', '/doto'];
    navigate(routes[newValue]);
  };

  return (
    <Box
      sx={{
        width: '100%', // Set the width to 100%
        position: 'fixed', // Fix the position
        bottom: 0, // Align to the bottom
        left: 0,
        right: 0,
      }}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={handleNavigation}
      >
        <BottomNavigationAction 
          color='primary'
          label={
            <Typography variant="body2" style={{ fontFamily: 'TheJamsil5Bold, sans-serif' }}>
              홈
            </Typography>
          }
          icon={<HomeIcon />}
        />
        <BottomNavigationAction 
          label={
            <Typography variant="body2" style={{ fontFamily: 'TheJamsil5Bold, sans-serif' }}>
              커뮤니티
            </Typography>
          }
          icon={<FavoriteIcon />}
        />
        <BottomNavigationAction 
          label={
            <Typography variant="body2" style={{ fontFamily: 'TheJamsil5Bold, sans-serif' }}>
              끝말잇기
            </Typography>
          }
          icon={<Grid4x4Icon />}
        />
        <BottomNavigationAction 
          label={
            <Typography variant="body2" style={{ fontFamily: 'TheJamsil5Bold, sans-serif' }}>
              게임
            </Typography>
          }
          icon={<MonetizationOnIcon />}
        />
      </BottomNavigation>
    </Box>
  );
}
