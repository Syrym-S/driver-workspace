import { Alert, CircularProgress, Box, Typography } from "@mui/material";
import { useApp } from "../app/context";
import Trip from "./Trip";

export default function CurrentTrip() {
  const { activeLead, isActiveLeadLoading } = useApp();

  if (isActiveLeadLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (activeLead?.lead_id) {
    return <Trip activeId={activeLead.lead_id} />;
  }


  return <Alert severity="info">
    Текущего рейса нету.
    Выберите из списка или свяжитесь с экспедиторами!
  </Alert>;
}