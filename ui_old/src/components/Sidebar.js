// Sidebar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { styled } from '@mui/system';
import { IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const SidebarContainer = styled('div')(({ open }) => ({
  width: open ? '300px' : '0px',
  backgroundColor: '#564D55',
  padding: open ? '100px' : '0px',
  position: 'fixed',
  height: '100%',
  overflowX: 'hidden',
  transition: 'width 0.3s, padding 0.3s',
  top: 0,
  left: 0,
  zIndex: 1,
}));

const SidebarLink = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: 'white',
  display: 'block',
  margin: '10px 0',
  '&:hover': {
    color: '#007bff',
  },
}));

const ToggleButton = styled(IconButton)(({ open }) => ({
  position: 'absolute',
  top: '20px',
  left: open ? '300px' : '0px',
  backgroundColor: '#564D55',
  color: 'white',
  '&:hover': {
    backgroundColor: '#3d3b40',
  },
  transition: 'left 0.3s',
  zIndex: 2,
}));

const Sidebar = () => {
  const [open, setOpen] = useState(false);

  const toggleSidebar = () => {
    setOpen(!open);
  };

  return (
    <>
      <SidebarContainer open={open}>
        <SidebarLink to="/">Leaderboard</SidebarLink>
        <SidebarLink to="/registration">Registration</SidebarLink>
      </SidebarContainer>
      <ToggleButton open={open} onClick={toggleSidebar}>
        {open ? <ChevronLeft /> : <ChevronRight />}
      </ToggleButton>
    </>
  );
};

export default Sidebar;
