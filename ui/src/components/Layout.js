// Layout.js
import React from 'react';
import Sidebar from './Sidebar';
import { styled } from '@mui/system';

const LayoutContainer = styled('div')({
  display: 'flex',
});

const MainContent = styled('div')({
  marginLeft: '200px',
  padding: '20px',
  width: '100%',
});

const Layout = ({ children }) => {
  return (
    <LayoutContainer>
      <Sidebar />
      <MainContent>
        {children}
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;
