import { useState } from "react";

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
