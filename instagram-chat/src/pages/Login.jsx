import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!loading) {
      setProgress(0);
      return;
    }

    let value = 0;
    const timer = setInterval(() => {
      value += Math.random() * 25;
      if (value >= 99) {
        value = 99;
        clearInterval(timer);
      }
      setProgress(Math.floor(value));
    }, 90);

    return () => clearInterval(timer);
  }, [loading]);

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (form.username.length < 3)
      return setToast("Username too short");

    if (form.password.length < 6)
      return setToast("Password too short");

    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      setProgress(100);
      setAuthUser(res.data);
      navigate("/", { replace: true });
    } catch {
      setToast("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className={`auth-bg ${loading ? "bg-loading" : ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Toast message={toast} onClose={() => setToast("")} />

      {/* ✨ Thin-air entrance */}
      <motion.form
        className="auth-glass"
        onSubmit={submit}
        initial={{ opacity: 0, scale: 0.85, filter: "blur(12px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
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
          {loading ? (
            <div className="progress-wrap">
              <motion.div
                className="progress-bar"
                style={{ width: `${progress}%` }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              />
            </div>
          ) : (
            "Login"
          )}
        </button>

        <p className="auth-footer">
          New here?{" "}
          <Link className="auth-link" to="/register">
            Create account
          </Link>
        </p>
      </motion.form>

      {/* 🎨 Effects styles */}
      <style>
        {`
        .bg-loading {
          animation: bgPulse 1.2s ease-in-out infinite;
        }

        @keyframes bgPulse {
          0% { filter: brightness(1); }
          50% { filter: brightness(1.05); }
          100% { filter: brightness(1); }
        }

        .auth-btn {
          position: relative;
          overflow: hidden;
          pointer-events: ${loading ? "none" : "auto"};
        }

        .progress-wrap {
          width: 100%;
          height: 4px;
          background: rgba(255,255,255,0.25);
          border-radius: 999px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(
            90deg,
            #4285f4,
            #ea4335,
            #fbbc05,
            #34a853
          );
          box-shadow: 0 0 12px rgba(66,133,244,0.8);
          transition: width 0.12s ease-out;
        }
        `}
      </style>
    </motion.div>
  );
}
