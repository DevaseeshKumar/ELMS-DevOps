import { useEffect, useState } from "react";
import axios from "axios";

export const useEmployeeSession = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:8000/api/employee/me", {
      withCredentials: true
    })
    .then((res) => setEmployee(res.data))
    .catch(() => setEmployee(null))
    .finally(() => setLoading(false));
  }, []);

  return { employee, loading };
};
