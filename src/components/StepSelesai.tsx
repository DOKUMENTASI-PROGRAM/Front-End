import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import shemaLogo from "../assets/shemalogo.png";

const StepSelesai = () => {
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [logoBase64, setLogoBase64] = useState<string>("");

  // helper ambil cookie
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2)
      return decodeURIComponent(parts.pop()!.split(";").shift()!);
    return null;
  };

  // Helper to delete a cookie
  const deleteCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  // Clear all registration-related cookies
  const clearRegistrationCookies = () => {
    deleteCookie("registrationData");
    deleteCookie("scheduleData");
    deleteCookie("finalRegistration");
  };

  useEffect(() => {
    // ambil data final dari cookie
    const finalData = getCookie("finalRegistration");
    if (finalData) {
      setRegistrationData(JSON.parse(finalData));

      // Clear cookies after successfully loading data
      // This ensures form is clean for next registration
      clearRegistrationCookies();
    }

    // Load logo as base64
    const loadLogo = async () => {
      try {
        const response = await fetch(shemaLogo);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoBase64(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Failed to load logo:", error);
      }
    };
    loadLogo();
  }, []);

  // ambil data dari registrationData
  const dataDiri = registrationData?.dataDiri || {};
  const jadwal = registrationData?.jadwal || {};
  const pembayaran = registrationData?.pembayaran || {};
  const bookingId = registrationData?.bookingId || "-";

  // Generate PDF function
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Colors - Maroon instead of bright red
    const maroonColor: [number, number, number] = [128, 0, 32]; // Maroon
    const textDark: [number, number, number] = [31, 41, 55]; // Gray-800
    const textGray: [number, number, number] = [107, 114, 128]; // Gray-500

    // Header - Logo/Brand Name with Maroon
    doc.setFillColor(...maroonColor);
    doc.rect(0, 0, pageWidth, 45, "F");

    // Add logo if available
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, "PNG", 15, 8, 28, 28);
      } catch (error) {
        console.error("Failed to add logo to PDF:", error);
      }
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("ShemaMusic", pageWidth / 2 + 10, 22, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Kursus Musik Profesional", pageWidth / 2 + 10, 32, {
      align: "center",
    });

    yPos = 60;

    // Title
    doc.setTextColor(...textDark);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("BUKTI PENDAFTARAN KURSUS", pageWidth / 2, yPos, {
      align: "center",
    });

    yPos += 10;

    // Booking ID
    doc.setFontSize(10);
    doc.setTextColor(...textGray);
    doc.setFont("helvetica", "normal");
    doc.text(`No. Pendaftaran: ${bookingId}`, pageWidth / 2, yPos, {
      align: "center",
    });

    yPos += 15;

    // Separator line
    doc.setDrawColor(...maroonColor);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);

    yPos += 15;

    // Section 1: Data Diri
    doc.setTextColor(...maroonColor);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DATA DIRI", 20, yPos);
    yPos += 8;

    doc.setTextColor(...textDark);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const dataDiriItems = [
      { label: "Nama Lengkap", value: dataDiri.full_name || "-" },
      { label: "Email", value: dataDiri.email || "-" },
      { label: "No. Telepon", value: dataDiri.phone || "-" },
      {
        label: "Tanggal Lahir",
        value: dataDiri.birth_date
          ? new Date(dataDiri.birth_date).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "-",
      },
      { label: "Alamat", value: dataDiri.address || "-" },
    ];

    dataDiriItems.forEach((item) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${item.label}:`, 20, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(item.value, 70, yPos);
      yPos += 7;
    });

    yPos += 8;

    // Section 2: Detail Kursus
    doc.setTextColor(...maroonColor);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DETAIL KURSUS", 20, yPos);
    yPos += 8;

    doc.setTextColor(...textDark);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const kursusItems = [
      { label: "Instrumen", value: dataDiri.instrument || "-" },
      { label: "Jenis Kelas", value: dataDiri.classType || "-" },
      { label: "Tingkat", value: dataDiri.level || "-" },
      {
        label: "Biaya Kursus",
        value: dataDiri.price
          ? `Rp ${dataDiri.price.toLocaleString("id-ID")}`
          : "-",
      },
    ];

    kursusItems.forEach((item) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${item.label}:`, 20, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(item.value, 70, yPos);
      yPos += 7;
    });

    yPos += 8;

    // Section 3: Jadwal Kursus
    doc.setTextColor(...maroonColor);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("JADWAL KURSUS", 20, yPos);
    yPos += 8;

    doc.setTextColor(...textDark);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    if (jadwal.schedules && jadwal.schedules.length > 0) {
      jadwal.schedules.forEach((schedule: string, index: number) => {
        doc.text(`${index + 1}. ${schedule}`, 20, yPos);
        yPos += 7;
      });
    } else {
      doc.text("Belum ada jadwal dipilih", 20, yPos);
      yPos += 7;
    }

    yPos += 8;

    // Section 4: Pembayaran
    doc.setTextColor(...maroonColor);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("PEMBAYARAN", 20, yPos);
    yPos += 8;

    doc.setTextColor(...textDark);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Metode Pembayaran:", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(pembayaran.paymentMethod || "-", 70, yPos);
    yPos += 7;

    doc.setFont("helvetica", "bold");
    doc.text("Status:", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 83, 9); // Amber/Orange for pending
    doc.text("Menunggu Verifikasi", 70, yPos);
    yPos += 15;

    // Footer box
    doc.setFillColor(254, 243, 199); // Yellow-100
    doc.roundedRect(20, yPos, pageWidth - 40, 30, 3, 3, "F");

    yPos += 8;
    doc.setTextColor(...textDark);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Catatan:", 25, yPos);
    yPos += 5;
    doc.setFont("helvetica", "normal");
    doc.text("• Pembayaran akan diverifikasi dalam 3x24 jam", 25, yPos);
    yPos += 5;
    doc.text(
      "• Anda akan dihubungi via WhatsApp untuk konfirmasi jadwal",
      25,
      yPos,
    );

    yPos += 20;

    // Generated date
    doc.setTextColor(...textGray);
    doc.setFontSize(8);
    const now = new Date();
    doc.text(
      `Dokumen ini digenerate pada: ${now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`,
      pageWidth / 2,
      yPos,
      { align: "center" },
    );

    // Footer branding with Maroon
    yPos = doc.internal.pageSize.getHeight() - 15;
    doc.setFillColor(...maroonColor);
    doc.rect(0, yPos - 5, pageWidth, 25, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("ShemaMusic - Kursus Musik Profesional", pageWidth / 2, yPos + 5, {
      align: "center",
    });
    doc.setFontSize(8);
    doc.text("Hubungi kami: 0811-1945-622", pageWidth / 2, yPos + 12, {
      align: "center",
    });

    // Save the PDF
    const fileName = `Bukti_Pendaftaran_ShemaMusic_${bookingId}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-sm">
      {/* Icon Success */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-center mb-2">
        Pendaftaran Berhasil!
      </h2>
      <p className="text-sm text-gray-600 text-center mb-8">
        Terima kasih telah mendaftar di ShemaMusic
      </p>

      {/* Ringkasan Pendaftaran */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="font-bold mb-4 text-center">Ringkasan Pendaftaran</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center shrink-0 font-bold text-xs">
              1
            </div>
            <div>
              <p className="font-medium text-gray-700">Data Diri</p>
              <p className="text-gray-600">Nama: {dataDiri.full_name}</p>
              <p className="text-gray-600">Email: {dataDiri.email}</p>
              <p className="text-gray-600">No. Telepon: {dataDiri.phone}</p>
              <p className="text-gray-600">
                Tanggal Lahir:{" "}
                {dataDiri.birth_date
                  ? new Date(dataDiri.birth_date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "-"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center shrink-0 font-bold text-xs">
              2
            </div>
            <div>
              <p className="font-medium text-gray-700">Kursus yang Dipilih</p>
              <p className="text-gray-600">
                Instrumen: {dataDiri.instrument || "-"}
              </p>
              <p className="text-gray-600">
                Jenis Kelas: {dataDiri.classType || "-"}
              </p>
              <p className="text-gray-600">Tingkat: {dataDiri.level || "-"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center shrink-0 font-bold text-xs">
              3
            </div>
            <div>
              <p className="font-medium text-gray-700">Jadwal Kursus</p>
              {jadwal.schedules && jadwal.schedules.length > 0 ? (
                jadwal.schedules.map((schedule: string, index: number) => (
                  <p key={index} className="text-gray-600">
                    • {schedule}
                  </p>
                ))
              ) : (
                <p className="text-gray-600">Belum ada jadwal dipilih</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center shrink-0 font-bold text-xs">
              4
            </div>
            <div>
              <p className="font-medium text-gray-700">Metode Pembayaran</p>
              <p className="text-gray-600">{pembayaran.paymentMethod || "-"}</p>
              <p className="text-gray-600 text-xs mt-1">
                Bukti pembayaran telah diunggah dan akan diverifikasi dalam 1x24
                jam
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Langkah Selanjutnya */}
      <div className="border-2 border-red-300 rounded-lg p-4 mb-6">
        <h3 className="font-bold mb-3 text-red-600">Langkah Selanjutnya:</h3>
        <ol className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="font-bold text-red-500 shrink-0">1</span>
            <span>
              Cek email untuk detail lengkap pendaftaran dan bukti pembayaran
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-red-500 shrink-0">2</span>
            <span>
              Tim kami akan memverifikasi pembayaran Anda dalam 3 X 24 jam
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-red-500 shrink-0">3</span>
            <span>
              Anda akan dihubungi via WhatsApp untuk konfirmasi jadwal dan
              memulai kursus
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-red-500 shrink-0">4</span>
            <span>Siap memulai kursus musik Anda 🎵</span>
          </li>
        </ol>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 bg-red-400 hover:bg-red-500 text-white font-medium rounded transition-colors"
        >
          Kembali ke Beranda
        </button>
        <button
          onClick={generatePDF}
          className="w-full py-3 border-2 border-gray-400 text-gray-700 font-medium rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Simpan Bukti Pendaftaran (PDF)
        </button>
      </div>

      {/* Contact Info */}
      <p className="text-center text-sm text-gray-600 mt-6">
        Butuh bantuan? Hubungi kami di{" "}
        <span className="font-bold text-red-500">0811-1945-622</span>
      </p>
    </div>
  );
};

export default StepSelesai;
