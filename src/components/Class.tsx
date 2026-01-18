import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Course {
  id: string;
  title: string;
  description: string;
  instrument: string;
  level: string;
  price_per_session: number;
  duration_minutes: number;
  max_students: number;
  is_active: boolean;
  type_course: string | null;
}

interface ClassData {
  title: string;
  price: string;
  desc: string;
  featuresLeft: string[];
  borderColor: string;
  type_course: string;
}

const ClassCard = ({
  title,
  price,
  desc,
  featuresLeft,
  borderColor,
}: ClassData) => {
  const navigate = useNavigate();
  return (
    <div
      className={`w-full h-full border-2 ${borderColor} rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 bg-white flex flex-col`}
    >
      {/* CONTENT */}
      <div className="flex-grow">
        <h2 className="text-2xl sm:text-3xl text-gray-800 font-bold mb-2">
          {title}
        </h2>

        <p className="text-red-600 font-bold text-xl sm:text-2xl mt-1">
          {price}
        </p>

        <p className="text-gray-700 mt-3 text-sm sm:text-base md:text-lg min-h-[3rem]">
          {desc}
        </p>

        <ul className="list-disc ml-5 mt-4 text-sm sm:text-base md:text-lg text-gray-700 space-y-1">
          {featuresLeft.map((feat, i) => (
            <li key={i} className="capitalize">
              {feat}
            </li>
          ))}
        </ul>
      </div>

      {/* BUTTON */}
      <button
        onClick={() => navigate("/registration")}
        className="mt-5 bg-red-400 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-full w-full transition-all duration-200"
      >
        Daftar Sekarang
      </button>
    </div>
  );
};

const Class = () => {
  const [classData, setClassData] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(
          "https://api.shemamusic.my.id/api/courses",
        );
        const result = await response.json();

        if (
          result.success &&
          result.data &&
          Array.isArray(result.data.courses)
        ) {
          // Map courses directly to display format
          const classesData: ClassData[] = result.data.courses.map(
            (course: Course) => {
              // Construct features list from course properties
              const features = [
                `Level: ${course.level}`,
                `Durasi: ${course.duration_minutes} Menit`,
                `Max Siswa: ${course.max_students}`,
                `Instrumen: ${course.instrument}`,
              ];

              // Add type info if available
              if (course.type_course) {
                features.push(`Tipe: ${course.type_course}`);
              }

              return {
                title: course.title,
                price:
                  course.price_per_session > 0
                    ? `Rp ${course.price_per_session.toLocaleString(
                        "id-ID",
                      )}/sesi`
                    : "Hubungi Kami",
                desc:
                  course.description || "Kelas musik berkualitas untuk Anda",
                featuresLeft: features,
                borderColor: "border-red-500",
                type_course: course.type_course || "general",
              };
            },
          );

          setClassData(classesData);
        }
      } catch (error) {
        console.error("Failed to fetch classes:", error);
        // Fall back to empty array on error
        setClassData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <p className="text-gray-500 text-lg">Memuat kelas yang tersedia...</p>
      </div>
    );
  }

  if (classData.length === 0) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <p className="text-gray-500 text-lg">
          Tidak ada kelas yang tersedia saat ini.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full grid justify-center grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-4 sm:px-6 md:px-0 py-6">
      {classData.map((item, index) => (
        <ClassCard key={index} {...item} />
      ))}
    </div>
  );
};

export default Class;
