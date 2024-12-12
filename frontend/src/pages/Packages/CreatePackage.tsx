import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Button,
  TextField,
  Stack,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  CloudUpload,
  FilePresent,
  Delete,
  Error as ErrorIcon,
  CheckCircle,
  Add as AddIcon,
} from '@mui/icons-material';
import { CloudDownload, GetApp } from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';
import { Package, MediaType, createPackageApi } from '../../services/packageService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import PackageTable from '../../components/PackageTable';

// Define the steps for the stepper
const steps = ['Package Details', 'Add URLs', 'Review Package'];

// Interface for individual download items
interface DownloadItem {
  id: number;
  url: string;
  filename: string;
  mediaType: string;
  status: 'valid' | 'invalid';
}

// Interface for the package form
interface PackageForm {
  title: string;
  description: string;
  items: DownloadItem[];
}

// Utility function to get file extension
const getFileExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) return '';
  return filename.substring(lastDotIndex).toLowerCase();
};

// Validation function
const validateItem = (url: string, filename: string, mediaType: string): 'valid' | 'invalid' => {
  // Check for non-empty fields
  if (!url.trim() || !filename.trim()) return 'invalid';

  if (mediaType === 'image' || mediaType === 'video') {
    return 'valid';
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    return 'invalid';
  }

  // Validate filename extension (optional but recommended)
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.pdf', '.webp', '.bmp'];
  const fileExtension = getFileExtension(filename);
  if (!validExtensions.includes(fileExtension)) return 'invalid';

  return 'valid';
};



const DropZone = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  border: `2px dashed ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  textAlign: 'center',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

const StatsBox = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: theme.spacing(2),
  marginTop: theme.spacing(3),
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
}));

const CreatePackagePage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<PackageForm>({
    title: '',
    description: '',
    items: [],
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [processedItems, setProcessedItems] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);

  const validateBeforeNext = (): boolean => {
    if (activeStep === 1) { // URL adding step
      const invalidItems = form.items.filter(item => item.status === 'invalid');
      if (invalidItems.length > 0) {
        setStepError(`Please fix ${invalidItems.length} invalid items before proceeding`);
        return false;
      }
    }
    setStepError(null);
    return true;
  };
  const navigate = useNavigate();

  // Sample CSV data
  const sampleCsvData = `https://picsum.photos/id/0/5000/3333,photo-0.jpg,image
  https://picsum.photos/id/1/5000/3333,photo-1.jpg,image
  https://picsum.photos/id/2/5000/3333,photo-2.jpg,image
  https://picsum.photos/id/3/5000/3333,photo-3.jpg,image
  https://picsum.photos/id/4/5000/3333,photo-4.jpg,image
  https://picsum.photos/id/5/5000/3333,photo-5.jpg,image
  https://picsum.photos/id/6/5000/3333,photo-6.jpg,image
  https://picsum.photos/id/7/5000/3333,photo-7.jpg,image
  https://picsum.photos/id/8/5000/3333,photo-8.jpg,image
  https://picsum.photos/id/9/5000/3333,photo-9.jpg,image
  https://picsum.photos/id/10/5000/3333,photo-10.jpg,image
  https://picsum.photos/id/11/5000/3333,photo-11.jpg,image
  https://picsum.photos/id/12/5000/3333,photo-12.jpg,image
  https://picsum.photos/id/13/5000/3333,photo-13.jpg,image
  https://picsum.photos/id/14/5000/3333,photo-14.jpg,image
  https://picsum.photos/id/15/5000/3333,photo-15.jpg,image
  https://picsum.photos/id/16/5000/3333,photo-16.jpg,image
  https://picsum.photos/id/17/5000/3333,photo-17.jpg,image
  https://www.sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4,big_buck_b.mp4,video
  `

  // Function to download the sample CSV
  const downloadSampleCSV = () => {
    const blob = new Blob([sampleCsvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_packages.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle CSV file upload
  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const chunkSize = 500;
      const reader = new FileReader();

      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const rows = text.split('\n');
        const items: DownloadItem[] = [];
        let itemId = 1;

        for (let i = 0; i < rows.length; i += chunkSize) {
          const chunk = rows.slice(i, i + chunkSize);
          const chunkItems = chunk.map((row) => {
            const [url, filename, mediaType] = row.split(',');
            const isValid = validateItem(url, filename, mediaType);
            return {
              id: itemId++,
              url: url?.trim() || '',
              filename: filename?.trim() || '',
              mediaType: (mediaType?.trim() || '').toLowerCase() as MediaType,
              status: isValid as 'valid' | 'invalid',
            };
          });
          items.push(...chunkItems);
          setProcessedItems((prev) => prev + chunk.length);
          setForm((prev) => ({
            ...prev,
            items: [...prev.items, ...chunkItems.filter(item => item.url && item.filename)],
          }));
          // Allow UI to update
          await new Promise((resolve) => setTimeout(resolve, 0));
        }

        setTotalItems(items.length);
        setLoading(false);
      };

      reader.readAsText(uploadedFile);
    }
  };

  // Handle manual addition of a new item
  const handleAddItem = () => {
    console.log("items", form.items);
    const newItem: DownloadItem = {
      id: form.items.length > 0 ? form.items.length + 1 : 1,
      url: '',
      filename: '',
      mediaType: 'image', // Set default value
      status: 'invalid',
    };
    setForm((prev) => ({
      ...prev,
      items: [newItem, ...prev.items],
    }));
  };

  // Handle deletion of an item
  const handleDeleteItem = (id: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  // Handle change in item fields
  const handleItemChange = (
    id: number,
    field: keyof Omit<DownloadItem, 'id' | 'status'>,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
              status: validateItem(
                field === 'url' ? value : item.url,
                field === 'filename' ? value : item.filename,
                field === 'mediaType' ? value : item.mediaType
              ),
            }
          : item
      ),
    }));
  };


  // Handle form submission
  const handleSubmit = async () => {
    try {
      // create a new package
      const newPackage: Package = {
        title: form.title,
        description: form.description,
        media: form.items.map((item) => ({
          url: item.url,
          filename: item.filename,
          mediaType: item.mediaType === 'image' ? MediaType.IMAGE : MediaType.VIDEO,
        })),
      };

      //Get token from local storage
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const result = await createPackageApi(token, newPackage);

      if (result.statusCode < 300) {
        toast.success('Package created successfully');
        // Redirect to the packages page
        navigate('/packages');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message;
      toast.error(msg || 'An unexpected error occurred');
    }

  };

  // Render different steps based on activeStep
  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Paper sx={{ p: 3, width: '100%', maxWidth: 800, mx: 'auto' }}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Package Title"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                required
              />
            </Stack>
          </Paper>
        );

      case 1:
        return (
          <Paper sx={{ p: 3, width: '100%', maxWidth: 900, mx: 'auto' }}>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Tooltip title="Download a sample CSV to understand the format">
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<GetApp />}
                    onClick={downloadSampleCSV}
                    sx={{
                      borderRadius: '8px',
                      padding: '10px 20px',
                      textTransform: 'none',
                      boxShadow: 3,
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                        boxShadow: 6,
                      },
                    }}
                  >
                    Download Sample CSV
                  </Button>
                </Tooltip>
              </Box>
              <DropZone
                onDrop={(e) => {
                  e.preventDefault();
                  const uploadedFile = e.dataTransfer?.files[0];
                  if (uploadedFile && uploadedFile.type === 'text/csv') {
                    handleCsvUpload({
                      target: { files: [uploadedFile] },
                    } as any);
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <CloudUpload sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Drag & Drop CSV File Here
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  or
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  disabled={loading}
                >
                  Choose File
                  <input
                    type="file"
                    hidden
                    accept=".csv"
                    onChange={handleCsvUpload}
                  />
                </Button>
              </DropZone>
              {form.items.length > 0 && (
                <>
                  <StatsBox>
                    <StatCard>
                      <Typography variant="h4" color="primary">
                        {form.items.length}
                      </Typography>
                      <Typography color="text.secondary">Total Items</Typography>
                    </StatCard>
                    <StatCard>
                      <Typography variant="h4" color="success.main">
                        {form.items.filter((i) => i.status === 'valid').length}
                      </Typography>
                      <Typography color="text.secondary">Valid Items</Typography>
                    </StatCard>
                    <StatCard>
                      <Typography variant="h4" color="error.main">
                        {form.items.filter((i) => i.status === 'invalid').length}
                      </Typography>
                      <Typography color="text.secondary">Invalid Items</Typography>
                    </StatCard>
                  </StatsBox>
                </>
              )}
              <Box sx={{ width: '100%' }}>
                <PackageTable
                  items={form.items}
                  onDeleteItem={handleDeleteItem}
                  onChangeItem={handleItemChange}
                />
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddItem}
                sx={{ mt: 2 }}
              >
                Add New Item
              </Button>
              {file && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <FilePresent color="primary" sx={{ mr: 2 }} />
                  <Typography variant="subtitle1" sx={{ flex: 1 }}>
                    {file.name}
                  </Typography>
                  <Tooltip title="Remove file">
                    <IconButton onClick={() => setFile(null)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              {loading && (
                <Box sx={{ width: '100%' }}>
                  <LinearProgress
                    variant="determinate"
                    value={(processedItems / totalItems) * 100}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography align="center" sx={{ mt: 1 }}>
                    Processing {processedItems} of {totalItems} items...
                  </Typography>
                </Box>
              )}

              {validationErrors.length > 0 && (
                <Alert
                  severity="warning"
                  sx={{ mt: 2 }}
                  action={
                    <Button color="inherit" size="small">
                      View Details
                    </Button>
                  }
                >
                  {validationErrors.length} items need attention
                </Alert>
              )}



            </Stack>
          </Paper>
        );

      case 2:
        return (
          <Paper sx={{ p: 3, width: '100%', maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Review Package
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography>
                <strong>Title:</strong> {form.title}
              </Typography>
              <Typography>
                <strong>Description:</strong> {form.description}
              </Typography>
              <Typography>
                <strong>Total Items:</strong> {form.items.length}
              </Typography>
            </Box>
            {validationErrors.length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {validationErrors.length} validation errors found
              </Alert>
            )}
            {/* You can add more detailed reviews or summaries here */}
          </Paper>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {stepError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {stepError}
        </Alert>
      )}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderStep()}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          disabled={activeStep === 0}
          onClick={() => setActiveStep((prev) => prev - 1)}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            if (validateBeforeNext()) {
              if (activeStep === steps.length - 1) {
                handleSubmit();
              } else {
                setActiveStep((prev) => prev + 1);
              }
            }
          }}
          disabled={
            (activeStep === 0 && !form.title) ||
            (activeStep === 1 && form.items.length === 0) ||
            (activeStep === 2 && validationErrors.length > 0)
          }
        >
          {activeStep === steps.length - 1 ? 'Create Package' : 'Next'}
        </Button>
      </Box>
    </Box>
  );
};

export default CreatePackagePage;