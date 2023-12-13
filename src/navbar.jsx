import * as React from 'react';
import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import { Menu } from '@mui/material';
import { Link } from 'react-router-dom';
import {Typography} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getUser } from './firebase';
import { useState, useEffect } from 'react';

export  function Drawer({user}) {
  const [state, setState] = React.useState({
    left: false,
  });

  const navigate = useNavigate();

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event &&
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const handleLoginClick = () => {
    // Navigate to the "/login" route
    navigate('/login');
    // Close the drawer
    setState({ ...state, left: false });
  };

  const handleSignUpClick = () => {
    // Navigate to the "/login" route
    navigate('/signup');
    // Close the drawer
    setState({ ...state, left: false });
  };

  const list = (anchor) => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>
        {['홈', '커뮤니티', '끝말잇기', '도토'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MenuIcon />}
              </ListItemIcon>
              <ListItemText primary={<Typography style={{ fontFamily: 'TheJamsil5Bold' }}>{text}</Typography>} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {user ? (
          <ListItem key="메일주소" disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
              <ListItemText primary={<Typography style={{ fontFamily: 'TheJamsil5Bold' }}>{user.email}</Typography>} />
            </ListItemButton>
          </ListItem>
        ) : (
          <ListItem key="로그인" disablePadding>
            <div className='flex flex-col'>
              <div>
                <ListItemButton onClick={handleLoginClick}>
                  <ListItemIcon>
                    <InboxIcon />
                  </ListItemIcon>
                  <ListItemText primary={<Typography style={{ fontFamily: 'TheJamsil5Bold' }}>로그인</Typography>} />
                </ListItemButton>
              </div>
              <div>
                <ListItemButton onClick={handleSignUpClick}>
                  <ListItemIcon>
                    <InboxIcon />
                  </ListItemIcon>
                  <ListItemText primary={<Typography style={{ fontFamily: 'TheJamsil5Bold' }}>회원가입</Typography>} />
                </ListItemButton>
              </div>
            </div>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <div>
        <React.Fragment key={'left'}>
          <Button onClick={toggleDrawer('left', true)}><MenuIcon sx={{fontSize: '35px'}} /></Button>
          <SwipeableDrawer
            anchor={'left'}
            open={state['left']}
            onClose={toggleDrawer('left', false)}
            onOpen={toggleDrawer('left', true)}
          >
            {list('left')}
          </SwipeableDrawer>
        </React.Fragment>
    </div>
  );
}

export default function NavigationBar(){
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = getUser((user) => {
      setUser(user);
    })});


  return(
    <div className='z-40 w-full h-14'>
    <div className='fixed flex items-center w-full pt-3 bg-white space-between'>
      <Drawer user={user} />
      <Link to="/"><p className='text-xl'>최도현 키우기</p></Link>
    </div>
    </div>
  )

}