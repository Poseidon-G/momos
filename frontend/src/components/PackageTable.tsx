import { CheckCircle, Delete, Error } from '@mui/icons-material';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    InputBase,
    Select,
    MenuItem,
    TablePagination,
    Chip,
    styled,
    IconButton,
  } from '@mui/material';
import { useState } from 'react';

interface DownloadItem {
  id: number;
  url: string;
  status: 'valid' | 'invalid';
}
  
  // Styled input component
  const StyledInput = styled(InputBase)(({ theme }) => ({
    padding: '4px 8px',
    borderRadius: 4,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  }));
  

interface PackageTableProps {

    items: DownloadItem[];
  
    onDeleteItem: (id: number) => void;
  
    onChangeItem: (id: number, field: keyof Omit<DownloadItem, 'id' | 'status'>, value: string) => void;
  
  }

  
  // Table component
  const PackageTable: React.FC<PackageTableProps> = ({ items, onChangeItem, onDeleteItem }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
  
    const handleChangePage = (event: unknown, newPage: number) => {
      setPage(newPage);
    };
  
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };
  
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>URL</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <StyledInput
                      fullWidth
                      value={item.url}
                      onChange={(e) => onChangeItem(item.id, 'url', e.target.value)}
                      placeholder="Enter URL"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={item.status === 'valid' ? <CheckCircle /> : <Error />}
                      label={item.status === 'valid' ? 'Valid' : 'Invalid'}
                      color={item.status === 'valid' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      color="error" 
                      onClick={() => onDeleteItem(item.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={items.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    );
  };

export default PackageTable;