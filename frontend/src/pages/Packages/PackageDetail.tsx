import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    Link,
    Chip,
    TablePagination,
    Alert,
} from "@mui/material";
import { fetchPackageDetailsApi, fetchPackageMediasApi, Media, MediaResponse, PaginatedResponse } from "../../services/packageService";
import LoadingFallback from "../../components/LoadingFallBack";
import { useParams } from "react-router-dom";



const PackageDetails = () => {
    const { id } = useParams<{ id: string }>();
    const [packageData, setPackageData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Pagination state
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [mediaList, setMediaList] = useState<MediaResponse[]>([]);
    const [totalMedia, setTotalMedia] = useState<number>(0);

    useEffect(() => {
        const fetchPackageDetails = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                if (id) {
                    const response = await fetchPackageDetailsApi(token, parseInt(id, 10));
                    if (response.statusCode === 200) {
                        setPackageData(response.data);
                    } else {
                        throw new Error(response.message || 'Failed to fetch package details');
                    }
                } else {
                    throw new Error('No package ID found');
                }
            } catch (error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPackageDetails();
    }, [id]);

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                console.log("Fetching Media...");
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) {
                    setError("Authentication token not found.");
                    setLoading(false);
                    return;
                }
    
                if (id) {
                    const response = await fetchPackageMediasApi(token, parseInt(id, 10), page + 1, rowsPerPage);
                    console.log("API Response:", response);
                    console.log("API Response Data:", response.data);
                    console.log("API Response Metadata:", response.data.data);
                    if (response.data && response.data.data && response.data.data.metadata) {
                        const data = response.data.data.data;
                        const total = response.data.data.metadata.total;
                        console.log("Media Data:", data);
                        console.log("Total Media:", total);
                        setMediaList(data);
                        setTotalMedia(total);
                    } else {
                        throw new Error("Invalid response structure");
                    }
                } else {
                    throw new Error("No package ID found");
                }
            } catch (err: any) {
                console.error("Fetch Media Error:", err);
                setError(err.message || "Failed to fetch media.");
            } finally {
                setLoading(false);
            }
        };
    
        fetchMedia();
    }, [id, page, rowsPerPage]);

    if (loading) {
        return <LoadingFallback />;
    }

    if (!packageData) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="info">No package data found</Alert>
            </Box>
        );
    }

    const { title, description, media, status } = packageData.data;

    // Function to determine Chip color based on status
    const getStatusChipColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "downloaded":
                return "success";
            case "pending":
                return "warning";
            case "error":
                return "error";
            default:
                return "default";
        }
    };

    // Handle page change
    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number
    ) => {
        setPage(newPage);
    };

    // Handle rows per page change
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box sx={{ padding: 4 }}>
            {/* Package Details */}
            <Typography variant="h4" gutterBottom>
                {title}
            </Typography>
            <Typography variant="body1" gutterBottom>
                {description}
            </Typography>

            {/* Overall Package Status */}
            <Box sx={{ marginTop: 2, marginBottom: 4 }}>
                <Chip
                    label={`Status: ${status}`}
                    color={getStatusChipColor(status)}
                    variant="outlined"
                    sx={{ fontSize: "1rem", padding: "5px 10px" }}
                />
            </Box>

            {/* Media List */}
            <Typography variant="h5" sx={{ marginTop: 4, marginBottom: 2 }}>
                Media List
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>ID</strong></TableCell>
                            <TableCell><strong>Preview</strong></TableCell>
                            <TableCell><strong>Original URL</strong></TableCell>
                            <TableCell><strong>Filename</strong></TableCell>
                            <TableCell><strong>New Image Link</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell> {/* New Status Column */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {mediaList.map((item: any) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.id}</TableCell>
                                <TableCell>
                                    <Avatar
                                        variant="square"
                                        src={item.originalUrl}
                                        alt={`Media ${item.id}`}
                                        sx={{ width: 56, height: 56 }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Link href={item.originalUrl} target="_blank" rel="noopener">
                                        View Original
                                    </Link>
                                </TableCell>
                                <TableCell>{item.filename}</TableCell>
                                <TableCell>
                                    {item.newUrl ? (
                                        <Link href={item.newUrl} target="_blank" rel="noopener">
                                            { item.mediaType === "image" ? "View Image" : "View Video" }
                                        </Link>
                                    ) : (
                                        "N/A"
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={item.status}
                                        color={getStatusChipColor(item.status)}
                                        variant="outlined"
                                        size="small"
                                    />
                                </TableCell> {/* Display Status */}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {/* Pagination Controls */}
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={totalMedia}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{
                        // Optional: Customize the pagination component's appearance
                        ".MuiTablePagination-toolbar": {
                            justifyContent: "flex-end",
                        },
                    }}
                />
            </TableContainer>
        </Box>
    );
};

// **Export the Component**
export default PackageDetails;