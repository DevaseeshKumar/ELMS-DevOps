// hooks/useHRSession.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const useHRSession = () => {
  const [hr, setHr] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/hr/profile", {
          credentials: "include",
        });

        if (res.status === 401) {
          setHr(null);
          navigate("/hr/login", {
            state: { message: "Session expired. Please login again." },
          });
        } else {
          const data = await res.json();
          setHr(data);
        }
      } catch (err) {
        setHr(null);
        navigate("/hr/login", {
          state: { message: "Session expired. Please login again." },
        });
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  return { hr, loading };
};
