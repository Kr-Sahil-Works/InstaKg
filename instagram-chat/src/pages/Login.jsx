import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { FiUser, FiLock } from "react-icons/fi";
import Toast from "../components/Toast";

export default function Login() {
  const { setAuthUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (form.username.length < 3)
      return setToast("Username too short");

    if (form.password.length < 6)
      return setToast("Password too short");

    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      setAuthUser(res.data);                 // ✅ CONTEXT
      navigate("/", { replace: true });      // ✅ REDIRECT
    } catch {
      setToast("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <Toast message={toast} onClose={() => setToast("")} />

      <form className="auth-glass" onSubmit={submit}>
        <h1 className="auth-title">Login</h1>

        <div className="auth-field">
          <FiUser />
          <input
            placeholder="Username"
            value={form.username}
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
          />
        </div>

        <div className="auth-field">
          <FiLock />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />
        </div>

        <button className="auth-btn" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="auth-footer">
          New here?{" "}
          <Link className="auth-link" to="/register">
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
}
