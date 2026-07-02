import { Button, CircularProgress } from '@mui/material';

export function SaveProfileButton({ visible, loading, onClick }) {
    if (!visible) {
        return null;
    }

    return (
        <Button
            variant='contained'
            size='large'
            onClick={onClick}
            disabled={loading}
            sx={{
                width: {
                    xs: '100%',
                    sm: 'auto',
                },
                alignSelf: {
                    xs: 'stretch',
                    sm: 'flex-start',
                },
            }}
        >
            {loading ? (
                <CircularProgress size={24} color='inherit' />
            ) : (
                'Сохранить'
            )}
        </Button>
    );
}
