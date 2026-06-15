import { createContext, useContext, useEffect, useState } from "react";
import { getActiveLead } from "../pages/Trip/api/api";
import { getUser } from "../pages/Profile/api";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [openLead, setOpenLead] = useState([]);
  const [activeLead, setActiveLead] = useState([]);

  // Запрос на активную поездку
  const fetchCurrentTrip = async () => {
    try {

      const res = await getActiveLead();

      setActiveLead(res || null);

    } catch (e) {
      console.error(e);
    } finally {
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
      setActiveLead
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
