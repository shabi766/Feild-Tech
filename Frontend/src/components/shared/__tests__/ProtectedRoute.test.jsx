import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import configureStore from "redux-mock-store";
import ProtectedRoute from "../ProtectedRoute.jsx";

const mockStore = configureStore([]);

const renderWithStore = (store, initialEntries = ["/protected"]) =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

describe("ProtectedRoute", () => {
  it("redirects unauthenticated users to /login", () => {
    const store = mockStore({
      auth: { user: null, isAuthenticated: false, loading: false },
    });

    renderWithStore(store);

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders children when user is authenticated", () => {
    const store = mockStore({
      auth: {
        user: { _id: "1", role: "Technician" },
        isAuthenticated: true,
        loading: false,
      },
    });

    renderWithStore(store);

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});

