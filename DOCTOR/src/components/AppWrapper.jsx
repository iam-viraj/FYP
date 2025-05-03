import React, { useState } from "react";
import App from "../App.jsx";
import { Context } from "../main";

export const AppWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [doctor, setDoctor] = useState({});

  return (
    <Context.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        doctor,
        setDoctor,
      }}
    >
      <App />
    </Context.Provider>
  );
}; 