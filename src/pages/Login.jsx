import { useState } from "react";
import { loginUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import { setAuthToken } from "../services/api";
import { Link } from "react-router-dom";


export default function Login({ setToken }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginUser(form.email, form.password);
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setAuthToken(data.token);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full mb-3 px-4 py-2 border rounded-lg"
          required
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full mb-4 px-4 py-2 border rounded-lg"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
       <p className="text-center mt-4 text-sm">
  Don’t have an account?{" "}
  <Link to="/register" className="text-blue-600 hover:underline">
    Register
  </Link>
</p>

<p className="text-center mt-4 text-sm">
  <Link to="/forgot-password" className="text-blue-600 hover:underline">
    Forgot Password
  </Link>
</p>

      </form>
    </div>
  );
}
