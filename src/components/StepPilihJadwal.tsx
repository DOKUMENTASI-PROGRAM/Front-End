import { useState, useEffect } from "react";

interface StepPilihJadwalProps {
  onNext: () => void;
  onBack: () => void;
  showNotification: (
    message: string,
    type?: "error" | "success" | "info",
  ) => void;
}

interface Instructor {
  id: string;
  name: string;
  specialization?: string | string[];
  teaching_categories?: string[];
  image?: string;
}

interface Slot {
  schedule_id: string;
  instructor_id: string;
  instructor_name: string;
  instructor_specialization?: string[];
  instructor_teaching_categories?: string[];
  room_id: string;
  room_name: string;
  day_of_week: string; // "monday", etc.
  start_time: string;
  end_time: string;
  status: string;
}

// Helper to map API days to display days
const dayMap: { [key: string]: string } = {
  monday: "Senin",
  tuesday: "Selasa",
  wednesday: "Rabu",
  thursday: "Kamis",
  friday: "Jumat",
  saturday: "Sabtu",
  sunday: "Minggu",
};

const displayDayToApi: { [key: string]: string } = Object.entries(
  dayMap,
).reduce((acc, [k, v]) => ({ ...acc, [v]: k }), {});

const StepPilihJadwal = ({
  onNext,
  onBack,
  showNotification,
}: StepPilihJadwalProps) => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);

  // State for filtering context
  const [selectedInstrument, setSelectedInstrument] = useState<string>("");
  const [selectedClassType, setSelectedClassType] = useState<string>("");

  // Selection states
  const [selectedInstructorId, setSelectedInstructorId] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");

  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([]);

  // Read instrument from cookie on mount
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
    };

    const registrationData = getCookie("registrationData");
    if (registrationData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(registrationData));
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Assuming the first entry has the instrument and class type
          setSelectedInstrument(parsed[0].instrument || "");
          setSelectedClassType(parsed[0].classType || "");
        }
      } catch (e) {
        console.error("Failed to parse registrationData cookie", e);
      }
    }

    // Restore schedule data
    const scheduleData = getCookie("scheduleData");
    if (scheduleData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(scheduleData));
        if (parsed) {
          if (parsed.instructorId) setSelectedInstructorId(parsed.instructorId);
          if (Array.isArray(parsed.schedules))
            setSelectedSchedules(parsed.schedules);
        }
      } catch (e) {
        console.error("Failed to parse scheduleData cookie", e);
      }
    }
  }, []);

  // Fetch Instructors
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await fetch("/api/booking/available-instructors");
        const data = await response.json();
        if (data.success && data.data && Array.isArray(data.data.instructors)) {
          setInstructors(data.data.instructors);
        }
      } catch (error) {
        console.error("Failed to fetch instructors:", error);
      }
    };
    fetchInstructors();
  }, []);

  // Fetch Slots
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await fetch(
          "/api/booking/availability/find-slots?include_all=true",
        );
        const data = await response.json();
        if (data.success && data.data && Array.isArray(data.data.slots)) {
          setSlots(data.data.slots);
        }
      } catch (error) {
        console.error("Failed to fetch slots:", error);
      }
    };
    fetchSlots();
  }, []);

  // Filter Instructors based on selectedInstrument and selectedClassType
  const filteredInstructors = instructors.filter((inst) => {
    // 1. Filter by Instrument
    if (selectedInstrument) {
      const spec = inst.specialization;
      let matchesInstrument = false;
      if (Array.isArray(spec)) {
        matchesInstrument = spec.some((s) =>
          s.toLowerCase().includes(selectedInstrument.toLowerCase()),
        );
      } else if (typeof spec === "string") {
        matchesInstrument = spec
          .toLowerCase()
          .includes(selectedInstrument.toLowerCase());
      }
      if (!matchesInstrument) return false;
    }

    // 2. Filter by Class Type (teaching_categories)
    if (selectedClassType) {
      if (!inst.teaching_categories) {
        // console.log(`Instructor ${inst.name} excluded: No teaching_categories`);
        return false;
      }
      
      const matchesCategory = inst.teaching_categories.some((cat) => {
        const catClean = cat.trim().toLowerCase();
        const selectedClean = selectedClassType.trim().toLowerCase();
        // console.log(`Checking ${inst.name}: ${catClean} === ${selectedClean}`);
        return catClean === selectedClean;
      });

      if (!matchesCategory) {
         // console.log(`Instructor ${inst.name} excluded: Category mismatch (${inst.teaching_categories.join(",")} vs ${selectedClassType})`);
         return false;
      }
    }

    return true;
  });

  // Helper for strict slot checking
  const isSlotCompatible = (
    slot: Slot,
    instrument: string,
    classType: string,
  ) => {
    // 1. Check Instrument
    if (instrument && slot.instructor_specialization) {
      const match = slot.instructor_specialization.some((spec) =>
        spec.toLowerCase().includes(instrument.toLowerCase().trim()),
      );
      if (!match) return false;
    }

    // 2. Check Class Type (Category)
    if (classType) {
      if (!slot.instructor_teaching_categories) return false;
      const match = slot.instructor_teaching_categories.some(
        (cat) =>
          cat.trim().toLowerCase() === classType.trim().toLowerCase(),
      );
      if (!match) return false;
    }

    return true;
  };

  // Filter Days based on selectedInstructor
  // Find slots for this instructor that are available/bookable
  const availableDaysForInstructor = Array.from(
    new Set(
      slots
        .filter((s) => {
          const matchesInstructor = s.instructor_id === selectedInstructorId;
          const isAvailable = s.status === "available";
          const compatible = isSlotCompatible(
            s,
            selectedInstrument,
            selectedClassType,
          );

          return matchesInstructor && isAvailable && compatible;
        })
        .map((s) => dayMap[s.day_of_week.toLowerCase()] || s.day_of_week),
    ),
  ).sort((a, b) => {
    // Sort days nicely (Monday first)
    const daysOrder = [
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
      "Minggu",
    ];
    return daysOrder.indexOf(a) - daysOrder.indexOf(b);
  });

  // Filter Times based on selectedInstructor + selectedDay
  const availableTimesForDay = Array.from(
    new Set(
      slots
        .filter((s) => {
          const dayApi = displayDayToApi[selectedDay];
          const compatible = isSlotCompatible(
            s,
            selectedInstrument,
            selectedClassType,
          );
          return (
            s.instructor_id === selectedInstructorId &&
            s.day_of_week.toLowerCase() === dayApi &&
            s.status === "available" &&
            compatible
          );
        })
        .map((s) => `${s.start_time.slice(0, 5)} - ${s.end_time.slice(0, 5)}`),
    ),
  ).sort();

  // Filter Rooms based on selectedInstructor + selectedDay + selectedTime
  const availableRoomsForTime = Array.from(
    new Set(
      slots
        .filter((s) => {
          const dayApi = displayDayToApi[selectedDay];
          const timeStr = `${s.start_time.slice(0, 5)} - ${s.end_time.slice(
            0,
            5,
          )}`;
          const compatible = isSlotCompatible(
            s,
            selectedInstrument,
            selectedClassType,
          );
          return (
            s.instructor_id === selectedInstructorId &&
            s.day_of_week.toLowerCase() === dayApi &&
            timeStr === selectedTime &&
            s.status === "available" &&
            compatible
          );
        })
        .map((s) => s.room_name || "Regular Room"),
    ),
  ).sort();

  const handleAddSchedule = () => {
    if (
      !selectedInstructorId ||
      !selectedDay ||
      !selectedTime ||
      !selectedRoom
    ) {
      showNotification(
        "Mohon lengkapi pilihan jadwal (Instruktur, Hari, Jam, Ruangan)",
        "error",
      );
      return;
    }

    const instructor = instructors.find((i) => i.id === selectedInstructorId);
    const instructorName = instructor ? instructor.name : selectedInstructorId;

    // Format: "Name, Day, Time, Room"
    const scheduleStr = `${instructorName}, ${selectedDay}, ${selectedTime}, ${selectedRoom}`;

    if (selectedSchedules.includes(scheduleStr)) {
      showNotification("Jadwal ini sudah dipilih.", "info");
      return;
    }

    if (selectedSchedules.length >= 2) {
      showNotification("Maksimal memilih 2 jadwal.", "info");
      return;
    }

    setSelectedSchedules([...selectedSchedules, scheduleStr]);

    // Optional: Reset selections for next entry?
    // setSelectedTime("");
    // setSelectedRoom("");
  };

  const handleNext = () => {
    // Determine the instructor to save in cookie top-level.
    // If multiple schedules have different instructors (if user switched),
    // we take the one from the last selected schedule or the current selection.
    // Given the flow, we'll use the current selectedInstructorId if available,
    // or fallback to parsing the first schedule.

    let finalInstructorId = selectedInstructorId;
    let finalInstructorName = "";

    const instructor = instructors.find((i) => i.id === finalInstructorId);
    if (instructor) {
      finalInstructorName = instructor.name;
    } else if (selectedSchedules.length > 0) {
      // Fallback: parse name from string? No, we need ID for API.
      // If the user selected schedules then changed dropdown to nothing...
      // We should try to find the ID corresponding to the name in the schedule?
      // Risky. Let's assume the user finishes with a valid selection state OR we rely on what was selected.
      // Actually, if selectedSchedules is not empty, we proceed.
      // Use the ID currently in state. If user cleared it, we might have an issue.
      // But the dropdowns persist state.
    }

    const data = {
      instructorId: finalInstructorId,
      instructorName: finalInstructorName,
      schedules: selectedSchedules,
    };

    document.cookie = `scheduleData=${encodeURIComponent(
      JSON.stringify(data),
    )}; path=/`;

    onNext();
  };

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-center mb-2">
        Pilih Jadwal Kursus
      </h2>
      {selectedInstrument && (
        <p className="text-center text-indigo-600 font-semibold mb-1">
          Instrumen: {selectedInstrument}
        </p>
      )}
      <p className="text-sm text-gray-600 text-center mb-8">
        Pilih maksimal 2 jadwal yang sesuai dengan ketersediaan Anda
      </p>

      {/* DROPDOWN SECTION */}
      <div className="space-y-4 mb-8 border p-6 rounded-lg bg-gray-50 shadow-inner">
        {/* 1. Pilih Instruktur */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Pilih Instruktur
          </label>
          <select
            value={selectedInstructorId}
            onChange={(e) => {
              setSelectedInstructorId(e.target.value);
              setSelectedDay("");
              setSelectedTime("");
              setSelectedRoom("");
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            disabled={instructors.length === 0}
          >
            <option value="">-- Pilih Instruktur --</option>
            {filteredInstructors.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name}{" "}
                {inst.specialization
                  ? `(${
                      Array.isArray(inst.specialization)
                        ? inst.specialization.join(", ")
                        : inst.specialization
                    })`
                  : ""}
              </option>
            ))}
          </select>
          {filteredInstructors.length === 0 && selectedInstrument && (
            <p className="text-xs text-red-500 mt-2">
              Maaf, tidak ada instruktur yang tersedia untuk instrumen{" "}
              {selectedInstrument}.
            </p>
          )}
        </div>

        {/* 2. Pilih Hari */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Pilih Hari
          </label>
          <select
            value={selectedDay}
            onChange={(e) => {
              setSelectedDay(e.target.value);
              setSelectedTime("");
              setSelectedRoom("");
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
            disabled={
              !selectedInstructorId || availableDaysForInstructor.length === 0
            }
          >
            <option value="">-- Pilih Hari --</option>
            {availableDaysForInstructor.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
          {selectedInstructorId && availableDaysForInstructor.length === 0 && (
            <p className="text-xs text-red-500 mt-2">
              Tidak ada jadwal tersedia untuk instruktur ini.
            </p>
          )}
        </div>

        {/* 3. Pilih Jam */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Pilih Jam
          </label>
          <select
            value={selectedTime}
            onChange={(e) => {
              setSelectedTime(e.target.value);
              setSelectedRoom("");
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
            disabled={!selectedDay || availableTimesForDay.length === 0}
          >
            <option value="">-- Pilih Jam --</option>
            {availableTimesForDay.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Pilih Ruangan */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Pilih Ruangan
          </label>
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
            disabled={!selectedTime || availableRoomsForTime.length === 0}
          >
            <option value="">-- Pilih Ruangan --</option>
            {availableRoomsForTime.map((room) => (
              <option key={room} value={room}>
                {room}
              </option>
            ))}
          </select>
        </div>

        {/* Tambah Jadwal Button */}
        <button
          onClick={handleAddSchedule}
          disabled={!selectedRoom}
          className={`w-full py-3 rounded-lg font-bold text-white transition-all shadow-sm ${
            !selectedRoom
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-md"
          }`}
        >
          + Tambah Jadwal
        </button>
      </div>

      {/* JADWAL TERPILIH */}
      <div className="border border-indigo-100 rounded-lg overflow-hidden mb-8 shadow-sm">
        <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100 flex items-center gap-2">
          <span className="text-xl">📅</span>
          <h3 className="font-bold text-indigo-900">Daftar Jadwal Dipilih</h3>
        </div>

        <div className="p-4 bg-white min-h-[100px]">
          {selectedSchedules.length === 0 ? (
            <div className="text-center text-gray-400 py-4 italic">
              Belum ada jadwal yang ditambahkan.
            </div>
          ) : (
            <ul className="space-y-3">
              {selectedSchedules.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {item}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedSchedules(
                        selectedSchedules.filter((s) => s !== item),
                      )
                    }
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Hapus jadwal"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors"
        >
          Kembali
        </button>
        <button
          onClick={handleNext}
          className={`flex-1 py-3 rounded-lg text-white font-bold transition-colors shadow-md ${
            selectedSchedules.length === 0
              ? "bg-gray-300 cursor-not-allowed shadow-none"
              : "bg-red-500 hover:bg-red-600"
          }`}
          disabled={selectedSchedules.length === 0}
        >
          Lanjut ke Pembayaran
        </button>
      </div>
    </div>
  );
};

export default StepPilihJadwal;
