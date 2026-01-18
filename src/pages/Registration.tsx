import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// import semua step
import StepIndicator from "../components/StepIndicator";
import StepDataDiri from "../components/StepDatadiri";
import StepPilihJadwal from "../components/StepPilihJadwal";
import StepPembayaran from "../components/StepPembayaran";
import StepSelesai from "../components/StepSelesai";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";

const Registration = () => {
  const [step, setStep] = useState<number>(1);
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  // Toast State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"error" | "success" | "info">(
    "error",
  );

  const showNotification = (
    message: string,
    type: "error" | "success" | "info" = "error",
  ) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Helper to delete a cookie
  const deleteCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  // Clear all registration cookies
  const clearRegistrationCookies = () => {
    deleteCookie("registrationData");
    deleteCookie("scheduleData");
    deleteCookie("finalRegistration");
  };

  // Clear cookies when navigating away from registration page
  useEffect(() => {
    // If we were on registration and now on different page, clear cookies
    if (
      prevPathRef.current === "/registration" &&
      location.pathname !== "/registration"
    ) {
      clearRegistrationCookies();
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  // Clear cookies on browser close/refresh (only if not on success step)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (step !== 4) {
        clearRegistrationCookies();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [step]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <Navbar />

      {/* Toast Notification - same as AIRecommendation */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />

      {/* CONTENT */}
      <div className="pt-24 pb-32 px-4">
        <div className="max-w-4xl mx-auto">
          <StepIndicator step={step} />

          <div className="mt-6">
            <div className="mt-6">
              {step === 1 && (
                <StepDataDiri
                  onNext={nextStep}
                  showNotification={showNotification}
                />
              )}
              {step === 2 && (
                <StepPilihJadwal
                  onBack={prevStep}
                  onNext={nextStep}
                  showNotification={showNotification}
                />
              )}
              {step === 3 && (
                <StepPembayaran
                  onBack={prevStep}
                  onNext={nextStep}
                  showNotification={showNotification}
                />
              )}
              {step === 4 && <StepSelesai />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;
