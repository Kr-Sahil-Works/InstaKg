import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { FiUser, FiLock } from "react-icons/fi";
import Toast from "../components/Toast";
import { FaMars, FaVenus } from "react-icons/fa";

export default function Register() {
  const { setAuthUser } = useContext(AuthContext); // ✅ FIX
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

  const submit = async (e) => {
    e.preventDefault();

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

      setAuthUser(res.data);                // ✅ CONTEXT UPDATE
      navigate("/", { replace: true });     // ✅ REDIRECT
    } catch (err) {
      setToast(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <Toast message={toast} onClose={() => setToast("")} />

      <form className="auth-glass" onSubmit={submit}>
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
              setForm({
                ...form,
                confirmPassword: e.target.value,
              })
            }
          />
        </div>

        {/* GENDER */}
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
          {loading ? "Creating..." : "Register"}
        </button>

        <p className="auth-footer">
          Already registered?{" "}
          <Link className="auth-link" to="/login">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}