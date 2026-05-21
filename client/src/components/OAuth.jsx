import React from "react";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { app } from "../firebase";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api.js";

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, provider);

      console.log("Firebase result.user:", result.user);

      // Send data to backend
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
          uid: result.user.uid,
        }),
      });

      const data = await res.json();
      console.log("Backend /api/auth/google status:", res.status, "response:", data);

      if (!res.ok || (data && data.success === false)) {
        throw new Error(data.message || "Authentication failed");
      }

      // server may return user at different shapes
      const user = data.user || data;
      console.log("Normalized user object:", user);

      // Save to Redux + localStorage
      dispatch(signInSuccess(user));
      try {
        localStorage.setItem("currentUser", JSON.stringify(user));
      } catch (e) {
        console.warn("Could not save to localStorage:", e);
      }

      // Admin detection (multiple fallbacks)
      const adminEmail = "suryapratapmallick0@gmail.com"; // update if needed
      const emailFromResult = result?.user?.email;
      const emailFromBackend = (user && (user.email || user.userEmail || user.user?.email)) || null;
      const isAdminFlag = !!(user && (user.isAdmin || user.role === "admin" || user.user?.isAdmin || user.is_admin));

      console.log("Emails:", { emailFromResult, emailFromBackend, adminEmail }, "isAdminFlag:", isAdminFlag);

      const emailToCheck = (emailFromBackend || emailFromResult || "").toLowerCase();

      if (isAdminFlag) {
        alert("Admin detected via isAdmin flag — redirecting to /admin/dashboard");
        navigate("/admin/dashboard");
        return;
      }

      if (emailToCheck && emailToCheck === adminEmail.toLowerCase()) {
        alert("Admin email matched — redirecting to /admin/dashboard");
        navigate("/admin/dashboard");
        return;
      }

      // fallback normal user
      navigate("/");
    } catch (error) {
      console.error("Google sign-in failed:", error);
      alert("Google sign-in failed. Check console for details.");
    }
  };

  return (
    <button
      onClick={handleGoogleClick}
      type="button"
      className="bg-red-700 text-white p-2 rounded-lg uppercase hover:opacity-95"
    >
      Continue with Google
    </button>
  );
}
