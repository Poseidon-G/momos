import React from 'react';
import { Card, CardActionArea, CardContent, Typography, Chip, Box } from '@mui/material';

export type PackageStatus = 'pending' | 'inprocess' | 'completed'; // Optional

interface PackageItemProps {
    title: string;
    description: string;
    status: PackageStatus; // Use the defined type
    onClick: () => void;
}

const getStatusChipColor = (status: PackageStatus) => {
    switch (status) {
        case 'pending':
            return 'warning'; // Amber
        case 'inprocess':
            return 'info'; // Blue
        case 'completed':
            return 'success'; // Green
        default:
            return 'default';
    }
};


const PackageItem: React.FC<PackageItemProps> = ({ title, description, status, onClick }) => {
    return (
        <Card>
            <CardActionArea onClick={onClick}>
                <CardContent
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '150px',
                    }}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" component="div">
                            {title}
                        </Typography>
                        <Chip
                            label={status.charAt(0).toUpperCase() + status.slice(1)}
                            color={getStatusChipColor(status)}
                            variant="filled"
                            size="small"
                        />
                    </Box>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={1}
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                        }}
                    >
                        {description}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};
export default PackageItem;