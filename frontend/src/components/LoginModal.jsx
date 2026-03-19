/* eslint-disable react/prop-types */
import { useState } from "react";
import axios from "axios";

const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth`;

const LoginModal = ({ onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState("login"); // 'login' or 'register'
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/login" : "/register";
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : form;
      const res = await axios.post(API_BASE + endpoint, payload);

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{mode === "login" ? "Sign in" : "Create your account"}</h2>
        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Sign in"
              : "Sign up"}
          </button>
        </form>

        <div className="modal-footer">
          <span
            style={{ cursor: "pointer", color: "#3ea6ff" }}
            onClick={() =>
              setMode((m) => (m === "login" ? "register" : "login"))
            }
          >
            {mode === "login"
              ? "Create account"
              : "Already have an account? Sign in"}
          </span>
          <span style={{ cursor: "pointer" }} onClick={onClose}>
            Close
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
