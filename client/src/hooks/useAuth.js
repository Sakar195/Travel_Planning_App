// src/hooks/useAuth.js
import { useContext } from "react";
import { AuthContext } from "../context/AuthContextValue";

export const useAuth = () => {
  return useContext(AuthContext);
};
