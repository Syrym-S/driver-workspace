import { Box, Pagination, useMediaQuery } from "@mui/material";

export function TendersPagination({ page, count, onChange }) {
    const isSmallMobile = useMediaQuery("(max-width:375px)");

    if (count <= 1) {
        return null;
    }

    return (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
            <Pagination
                page={page}
                count={count}
                onChange={onChange}
                color='primary'
                shape='rounded'
                size={isSmallMobile ? "small" : "medium"}
                siblingCount={isSmallMobile ? 0 : 1}
                boundaryCount={1}
            />
        </Box>
    );
}
