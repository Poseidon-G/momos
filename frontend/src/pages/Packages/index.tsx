import React, { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Grid, Paper, Stack, Typography } from "@mui/material"; // Use Grid from @mui/material
import { styled } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import PackageItem, { PackageStatus } from "../../components/PackageItem";
import { Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { fetchPackagesApi } from "../../services/packageService";
import { toast } from "react-toastify";

const Loading: React.FC = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
            }}
        >
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2 }}>
                Loading...
            </Typography>
        </Box>
    );
};

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

// 4 items per row
const itemsPerRow = 4;
const categoryFilter: { [key: string]: number } = {
    electronics: 24,
    fashion: 12,
    food: 18,
    services: 3,
};


const Packages = () => {
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    console.log("Packages", packages);
    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                
                const response = await fetchPackagesApi(token);
                if (response.statusCode === 200) {
                    setPackages(response.data?.data?.data || []);
                } else {
                    throw new Error(response.message);
                }
            } catch (error: any) {
                console.log("Error fetching packages", error.message);
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPackages();
    }, [navigate]);

    const handlePackageClick = (id: number) => {
        navigate(`/packages/${id}`);
    };


    const handleCreatePackage = () => {
        navigate('/packages/create');
    };

    if (loading) {
        return <Loading />;
    }
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                p: 3
            }}
        >
            <Stack
                spacing={3}
                sx={{
                    maxWidth: 'md',
                    width: '100%',
                    alignItems: 'center'
                }}
            >
                <Box
                    sx={{
                        width: { xs: '150px', sm: '200px' },
                        height: { xs: '150px', sm: '200px' },
                    }}
                >
                    <Grid item xs={12}>
                        <Box
                            onClick={handleCreatePackage}
                            role="button"
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px dashed',
                                borderColor: 'grey.300',
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                height: '100%',
                                cursor: 'pointer',
                                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                    '& .uploadIcon': {
                                        transform: 'scale(1.1)',
                                        color: 'primary.main',
                                    },
                                    '& .uploadText': {
                                        color: 'primary.main',
                                    }
                                }
                            }}
                        >
                            <Add
                                className="uploadIcon"
                                sx={{
                                    width: '80%',
                                    height: '60%',
                                    fontSize: { xs: 40, sm: 50 },
                                    color: 'grey.500',
                                    mb: 1,
                                    transition: 'all 0.3s ease'
                                }}
                            />
                            <Typography
                                className="uploadText"
                                variant="body1"
                                color="grey.600"
                                sx={{
                                    transition: 'all 0.3s ease',
                                    fontSize: { xs: '0.875rem', sm: '1rem' }
                                }}
                            >
                                Create new package
                            </Typography>
                        </Box>
                    </Grid>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        mt: 2
                    }}
                >
                    <Typography variant="body1">
                        Your recent packages
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        View all -&gt;
                    </Typography>
                </Box>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {packages.map((pkg) => (
                        <Grid item xs={12} sm={6} md={4} key={pkg.id}>
                            <PackageItem
                                title={pkg.title}
                                description={pkg.description}
                                status={pkg.status}
                                onClick={() => handlePackageClick(pkg.id)}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Stack>
        </Box>
    );
};

export default Packages;