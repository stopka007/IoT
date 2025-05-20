import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { render, screen } from "@testing-library/react";

import { describe, expect, it, vi } from "vitest";

import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";

const MockChild = () => <div>Protected Content</div>;

vi.mock("./context/AuthContext", () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: {
    userId: string;
    role: "admin" | "user";
    username?: string;
    email?: string;
  } | null;
}

describe("ProtectedRoute", () => {
  const renderProtectedRoute = (authState: AuthState) => {
    vi.mocked(useAuth).mockReturnValue({
      ...authState,
      accessToken: authState.isAuthenticated ? "mock-token" : null,
      refreshToken: authState.isAuthenticated ? "mock-refresh-token" : null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    return render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/protected"]}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/protected" element={<MockChild />} />
            </Route>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );
  };

  it("shows loading state when authentication is loading", () => {
    renderProtectedRoute({ isLoading: true, isAuthenticated: false, user: null });
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("redirects to login when not authenticated", () => {
    renderProtectedRoute({ isLoading: false, isAuthenticated: false, user: null });
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders protected content when authenticated", () => {
    renderProtectedRoute({
      isLoading: false,
      isAuthenticated: true,
      user: { userId: "1", role: "user" },
    });
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("redirects to home when user role is not allowed", () => {
    renderProtectedRoute({
      isLoading: false,
      isAuthenticated: true,
      user: { userId: "1", role: "user" },
    });

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/protected"]}>
          <Routes>
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/protected" element={<MockChild />} />
            </Route>
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });
});
