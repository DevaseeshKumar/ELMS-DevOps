// hooks/useAdminSession.js
import { useEffect, useState } from "react";
import axios from "axios";

export const useAdminSession = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/admin/me", { withCredentials: true })
      .then((res) => setAdmin(res.data))
      .catch(() => setAdmin(null))
      .finally(() => setLoading(false));
  }, []);

  return { admin, loading };
};
