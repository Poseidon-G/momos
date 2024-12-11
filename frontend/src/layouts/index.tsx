import React from "react";
import Header from "./header";
import Footer from "./footer";
import { Box } from "@mui/material";

interface LayoutProps {
  children: React.ReactNode;
  isLoggedIn: boolean;
}

export const Layout = ({ children, isLoggedIn }: LayoutProps) => {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Header isLoggedIn={isLoggedIn} />
        <Box component="main" sx={{ flex: 1, p: 3 }}>
          <main>{children}</main>
        </Box>
        <Footer />
      </Box>
    </>
  );
};
