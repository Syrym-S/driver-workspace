import { createContext, useContext, useEffect, useState } from "react";
import { getActiveLead } from "../pages/Trip/api/api";
import { getUser } from "../pages/Profile/api";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [openLead, setOpenLead] = useState([]);
  const [activeLead, setActiveLead] = useState(null);
  const [isActiveLeadLoading, setIsActiveLeadLoading] = useState(true);

  // Запрос на активную поездку
  const fetchCurrentTrip = async () => {
    try {
      setIsActiveLeadLoading(true);

      const res = await getActiveLead();

      setActiveLead(res || null);

    } catch (e) {
      console.error(e);
      setActiveLead(null);
    } finally {
      setIsActiveLeadLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentTrip();
  }, []);

  // Запрос на данные пользователя
  const fetchUser = async () => {
    try {

      const res = await getUser();

      setUser(res?.data || null);

    } catch (e) {
      console.error(e);
    } finally {
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      openLead,
      setOpenLead,

      // активные лид
      activeLead,
      setActiveLead,
      isActiveLeadLoading,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
