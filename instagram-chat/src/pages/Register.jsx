import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { FiUser, FiLock } from "react-icons/fi";
import Toast from "../components/Toast";
import { FaMars, FaVenus } from "react-icons/fa";

export default function Register() {
  const { setAuthUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
    gender: "",
  });

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

    if (form.fullName.length < 3)
      return setToast("Full name too short");

    if (form.username.length < 3)
      return setToast("Username too short");

    if (form.password.length < 6)
      return setToast("Password too short");

    if (form.password !== form.confirmPassword)
      return setToast("Passwords do not match");

    if (!form.gender)
      return setToast("Select gender");

    setLoading(true);
    try {
      const res = await api.post("/auth/signup", {
        ...form,
        username: form.username.toLowerCase(),
      });

      setProgress(100);
      setAuthUser(res.data);
      navigate("/", { replace: true });
    } catch (err) {
      setToast(err.response?.data?.error || "Signup failed");
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
        <h1 className="auth-title">Register</h1>

        <div className="auth-field">
          <FiUser />
          <input
            placeholder="Full name"
            onChange={(e) =>
              setForm({ ...form, fullName: e.target.value })
            }
          />
        </div>

        <div className="auth-field">
          <FiUser />
          <input
            placeholder="Username"
            onChange={(e) =>
              setForm({
                ...form,
                username: e.target.value.toLowerCase(),
              })
            }
          />
        </div>

        <div className="auth-field">
          <FiLock />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />
        </div>

        <div className="auth-field">
          <FiLock />
          <input
            type="password"
            placeholder="Confirm password"
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
          />
        </div>

        {/* Gender */}
        <div className="gender-wrap">
          <label className={`gender-card male ${form.gender === "male" ? "active" : ""}`}>
            <input
              type="radio"
              checked={form.gender === "male"}
              onChange={() => setForm({ ...form, gender: "male" })}
            />
            <FaMars />
            <span>Male</span>
          </label>

          <label className={`gender-card female ${form.gender === "female" ? "active" : ""}`}>
            <input
              type="radio"
              checked={form.gender === "female"}
              onChange={() => setForm({ ...form, gender: "female" })}
            />
            <FaVenus />
            <span>Female</span>
          </label>
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
            "Register"
          )}
        </button>

        <p className="auth-footer">
          Already registered?{" "}
          <Link className="auth-link" to="/login">
            Login here
          </Link>
        </p>
      </motion.form>

      {/* 🎨 Same styles as Login */}
      <style>
        {`
     .gender-card {
  color: #fff;
  transition: background-color 0.25s ease, box-shadow 0.25s ease;
}

/* 👨 Male – subtle blue */
.gender-card.male.active {
  background-color: rgba(59, 130, 246, 0.18);
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.35);
}

/* 👩 Female – subtle yellow */
.gender-card.female.active {
  background-color: rgba(234, 179, 8, 0.20);
  box-shadow: 0 0 8px rgba(234, 179, 8, 0.35);
}


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
