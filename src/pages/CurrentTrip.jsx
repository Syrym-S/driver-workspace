import { Alert, CircularProgress, Box } from "@mui/material";
import { useApp } from "../app/context";
import { getActiveLead } from "./Trip/api/api";
import Trip from "./Trip";
import { useEffect, useState } from "react";

export default function CurrentTrip() {
  const {activeLead} = useApp();


  // Active Trip
  if(activeLead?.lead_id){
    return <Trip activeId={activeLead.lead_id}/>
  }

  return <Alert severity="info">
    Текущйи рейса нету.
    Выберите из списка или связитесь с экспедиторами!
  </Alert>;
}