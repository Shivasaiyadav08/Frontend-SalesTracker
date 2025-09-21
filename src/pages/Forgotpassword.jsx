
import { useState } from "react";
import { forgotPassword } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!email) return alert("Please enter your registered email");
  setLoading(true);
  try {
    // Call your backend endpoint to request a password reset email
    await forgotPassword(email)
    setMessage(`If ${email} exists, a reset link has been sent! Check your inbox.`);
  } catch (err) {
    setMessage(err.response?.data?.message || "Error sending reset email");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow-md sm:p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center sm:text-3xl">
        Forgot Password
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-base"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white font-medium py-3 rounded-md hover:bg-blue-700 transition-colors sm:text-lg"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      {message && (
        <p className="mt-4 text-center text-green-600 font-medium">{message}</p>
      )}
    </div>
  );
}
