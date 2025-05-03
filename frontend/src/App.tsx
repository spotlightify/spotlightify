import React from "react";
import { MemoryRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Spotlightify from "./Spotlightify";
import { SpotlightifyProvider } from "./context/SpotlightifyContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <QueryClientProvider client={queryClient}>
              <SpotlightifyProvider>
                <Spotlightify />
              </SpotlightifyProvider>
              <ReactQueryDevtools />
            </QueryClientProvider>
          }
        />
      </Routes>
    </Router>
  );
}
