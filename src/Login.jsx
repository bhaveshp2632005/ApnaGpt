import { useState, useContext, useEffect } from "react";
import { Mail, Lock, Chrome, Eye, EyeOff, ShieldAlert } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext.jsx";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  // 🧠 Redirect if already logged in
  

  // ⚙️ Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        "https://apnagpt-backend-4u32.onrender.com/auth/login",
        { email, password },
        { withCredentials: true }
      );

      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed. Try again.");
      setTimeout(() => setError(""), 4000); // auto-clear error after 4s
    }
  };

  // 🌐 Google Login Redirect
  const handleGoogleLogin = () => {
    window.location.href = "https://apnagpt-backend-4u32.onrender.com/auth/google";
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Welcome Back 👋
        </h2>

        {/* ⚠️ Error Message */}
        {error && (
          <div className="flex items-center justify-center gap-2 text-red-500 bg-red-950/30 border border-red-800 rounded-md py-2 px-3 mb-4 text-sm">
            <ShieldAlert className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* ✉️ Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Field */}
          <div className="flex items-center border border-gray-700 rounded-lg px-3 py-2 bg-gray-800">
            <Mail className="text-gray-400 mr-2" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-transparent w-full outline-none text-white"
            />
          </div>

          {/* Password Field */}
          <div className="flex items-center border border-gray-700 rounded-lg px-3 py-2 bg-gray-800">
            <Lock className="text-gray-400 mr-2" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-transparent w-full outline-none text-white"
            />
            {showPassword ? (
              <EyeOff
                className="text-gray-400 cursor-pointer ml-2 hover:text-gray-200"
                onClick={() => setShowPassword(false)}
              />
            ) : (
              <Eye
                className="text-gray-400 cursor-pointer ml-2 hover:text-gray-200"
                onClick={() => setShowPassword(true)}
              />
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-lg transition duration-300"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-700"></div>
          <span className="px-3 text-gray-400 text-sm">OR</span>
          <div className="flex-grow h-px bg-gray-700"></div>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition duration-300"
        >
          <Chrome className="w-5 h-5 text-red-400" />
          Continue with Google
        </button>

        {/* Signup Link */}
        <p className="text-gray-400 text-sm text-center mt-6">
          Don’t have an account?{" "}
          <a href="/signup" className="text-emerald-400 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
