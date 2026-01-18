import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

interface StepPembayaranProps {
  onBack: () => void;
  onNext: () => void;
  showNotification: (
    message: string,
    type?: "error" | "success" | "info",
  ) => void;
}

const StepPembayaran = ({
  onBack,
  onNext,
  showNotification,
}: StepPembayaranProps) => {
  const [method, setMethod] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [scheduleData, setScheduleData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // helper ambil cookie
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2)
      return decodeURIComponent(parts.pop()!.split(";").shift()!);
    return null;
  };

  // Load data dari cookies saat component mount
  useEffect(() => {
    const dataDiri = getCookie("registrationData");
    const jadwal = getCookie("scheduleData");

    if (dataDiri) {
      setRegistrationData(JSON.parse(dataDiri));
    }
    if (jadwal) {
      setScheduleData(JSON.parse(jadwal));
    }
  }, []);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!method) {
      showNotification("Pilih metode pembayaran", "error");
      return;
    }

    if (!file) {
      showNotification("Upload bukti pembayaran", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload File to Supabase
      const fileExt = file.name.split(".").pop();
      const fileName = `payment-${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // 2. Get Public URL
      const { data: urlData } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // ambil data sebelumnya
      const dataDiri = registrationData?.[0] || {};
      const jadwal = scheduleData || {};
      const schedules = jadwal.schedules || [];

      // Helper to parse schedule string "Instructor, Day, Time" -> { day, start_time, end_time }
      const parseSchedule = (scheduleStr: string) => {
        const parts = scheduleStr.split(",").map((s) => s.trim());
        if (parts.length < 3) return null;
        // parts[0] is instructor name (or id if we change logic), parts[1] is Day, parts[2] is Time "10.30 - 12.00"

        const dayMapReverse: { [key: string]: string } = {
          Senin: "monday",
          Selasa: "tuesday",
          Rabu: "wednesday",
          Kamis: "thursday",
          Jumat: "friday",
          Sabtu: "saturday",
          Minggu: "sunday",
        };

        const day = dayMapReverse[parts[1]] || "monday";
        const timeParts = parts[2].split("-").map((t) => t.trim());
        const startTime = timeParts[0].replace(".", ":"); // "10.30" -> "10:30"
        const endTime = timeParts[1]
          ? timeParts[1].replace(".", ":")
          : startTime; // Simplified

        return {
          day: day,
          start_time: startTime,
          end_time: endTime,
          instructor_id: jadwal.instructorId || "", // From cookie
          selected_at: new Date().toISOString(),
        };
      };

      const payload: any = {
        full_name: dataDiri.full_name,
        email: dataDiri.email,
        course_id: dataDiri.course_id || "course-uuid-placeholder",
        address: dataDiri.address,
        birth_place: dataDiri.birth_place,
        birth_date: dataDiri.birth_date,
        consent: true,
        captcha_token: "dummy-token",
        idempotency_key: crypto.randomUUID(),
        payment_proof: publicUrl,
        notes: `Payment Method: ${method}`,
        referral_source: "website",
        type_course: dataDiri.classType,
        occupation: dataDiri.occupation, // Add occupation here
      };

      // Add optional fields only if they exist and aren't empty
      if (dataDiri.school && dataDiri.school.trim() !== "") {
        payload.school = dataDiri.school;
      }
      if (dataDiri.studentClass && dataDiri.studentClass.trim() !== "") {
        payload.class = dataDiri.studentClass; // Send as string, e.g., "10 IPA 2"
      }
      if (dataDiri.guardian_name && dataDiri.guardian_name.trim() !== "") {
        payload.guardian_name = dataDiri.guardian_name;
      }
      if (dataDiri.guardian_phone && dataDiri.guardian_phone.trim() !== "") {
        payload.guardian_wa_number = dataDiri.guardian_phone;
      }

      if (schedules.length > 0) {
        payload.first_preference = parseSchedule(schedules[0]);
      }
      if (schedules.length > 1) {
        payload.second_preference = parseSchedule(schedules[1]);
      }

      const response = await fetch("/api/booking/register-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        // simpan final data components locally just for display in next step if needed
        const pembayaranData = {
          paymentMethod: method,
          proofName: file.name,
          paymentDate: new Date().toISOString(),
          proofUrl: publicUrl,
        };
        const finalData = {
          dataDiri: dataDiri,
          jadwal: jadwal,
          pembayaran: pembayaranData,
          bookingId: result.data.booking_id,
        };

        document.cookie = `finalRegistration=${encodeURIComponent(
          JSON.stringify(finalData),
        )}; path=/`;

        onNext();
      } else {
        showNotification(`Registration failed: ${result.message}`, "error");
      }
    } catch (error) {
      console.error("Error submitting registration:", error);
      showNotification("Terjadi kesalahan, silakan coba lagi.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ambil data dari cookies
  const dataDiri = registrationData?.[0] || {};
  const jadwalList = scheduleData?.schedules || [];

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-center mb-2">Pembayaran</h2>
      <p className="text-sm text-gray-600 text-center mb-8">
        Pilih metode pembayaran dan upload bukti transfer
      </p>

      {/* Ringkasan Pendaftaran */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-bold mb-3">Ringkasan Pendaftaran</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Nama</span>
            <span className="font-medium text-right">
              {dataDiri.full_name || "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email</span>
            <span className="font-medium text-right">
              {dataDiri.email || "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">No. Telepon</span>
            <span className="font-medium text-right">
              {dataDiri.phone || "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tanggal Lahir</span>
            <span className="font-medium text-right">
              {dataDiri.birth_date
                ? new Date(dataDiri.birth_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Instrumen</span>
            <span className="font-medium text-right">
              {dataDiri.instrument || "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Jenis Kelas</span>
            <span className="font-medium text-right">
              {dataDiri.classType || "-"}
            </span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-gray-600">Jadwal Dipilih</span>
            <div className="text-right">
              {jadwalList.length > 0 ? (
                jadwalList.map((schedule: string, index: number) => (
                  <div key={index} className="font-medium">
                    ● [{schedule}]
                  </div>
                ))
              ) : (
                <div className="font-medium text-gray-400">
                  Belum ada jadwal
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Total Pembayaran */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b-2">
        <span className="font-bold text-lg">Total Pembayaran:</span>
        <span className="font-bold text-xl text-red-500">
          {dataDiri.price
            ? `Rp ${dataDiri.price.toLocaleString("id-ID")}`
            : "Rp 0"}
        </span>
      </div>

      {/* Pilih Metode Pembayaran */}
      <div className="mb-6">
        <h3 className="font-bold mb-3">Pilih Metode Pembayaran</h3>
        <div className="space-y-3">
          <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="payment"
              value="BCA"
              checked={method === "BCA"}
              onChange={(e) => setMethod(e.target.value)}
              className="mr-3"
            />
            <div className="flex items-center gap-3 flex-1">
              <span className="text-2xl">🏦</span>
              <div>
                <div className="font-medium">Transfer Bank BCA</div>
                <div className="text-sm text-gray-500">
                  Rek: 0891556423 a/n ShemaMusic
                </div>
              </div>
            </div>
          </label>

          <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="payment"
              value="GoPay"
              checked={method === "GoPay"}
              onChange={(e) => setMethod(e.target.value)}
              className="mr-3"
            />
            <div className="flex items-center gap-3 flex-1">
              <span className="text-2xl">💳</span>
              <div>
                <div className="font-medium">GoPay / E-Wallet</div>
                <div className="text-sm text-gray-500">Rek: 0811-2345-xxx</div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Upload Bukti Pembayaran */}
      <div className="mb-6">
        <h3 className="font-bold mb-3">Upload Bukti Pembayaran</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
          <div className="mb-4">
            <span className="text-6xl">📤</span>
          </div>
          <input
            type="file"
            id="file-upload"
            accept="image/png, image/jpeg"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium"
          >
            Klik untuk upload bukti transfer
          </label>
          <p className="text-sm text-gray-500 mt-2">
            (PNG, JPG, JPEG) Maks 5MB
          </p>
          {file && (
            <p className="text-sm text-green-600 mt-2 font-medium">
              ✓ File terpilih: {file.name}
            </p>
          )}
        </div>
      </div>

      {/* Catatan Pembayaran */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <span className="text-blue-600 font-bold text-lg">ℹ️</span>
          <div className="text-sm text-gray-700">
            <p className="font-bold mb-2">Catatan Pembayaran:</p>
            <ul className="list-disc ml-4 space-y-1">
              <li>Lakukan pembayaran sesuai dengan total yang tertera</li>
              <li>Upload bukti transfer dalam format gambar (PNG/JPG)</li>
              <li>Pembayaran akan diverifikasi dalam waktu 1x24 jam</li>
              <li>Anda akan menerima konfirmasi via email dan WhatsApp</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 border-2 border-gray-400 rounded text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Kembali
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`flex-1 py-3 bg-red-400 hover:bg-red-500 text-white font-medium rounded transition-colors ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Memproses..." : "Submit Pendaftaran"}
        </button>
      </div>
    </div>
  );
};

export default StepPembayaran;
