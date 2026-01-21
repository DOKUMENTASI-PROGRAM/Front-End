import { Award, Lightbulb, Users } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import abouthero from "../assets/aboutheroa.png";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const About = () => {
  // Load semua gambar dari folder assets/siswa
  const studentImages = import.meta.glob(
    "../assets/siswa/*.{png,jpg,jpeg,svg,webp}",
    { eager: true },
  );

  const students = Object.keys(studentImages).map((path, index) => ({
    id: index + 1,
    name: `Siswa ${index + 1}`,
    image: (studentImages[path] as any).default || studentImages[path],
  }));

  // Duplikasi list siswa agar marquee tidak terputus
  const marqueeStudents = [...students, ...students];

  return (
    <MainLayout>
      <div className="min-h-screen bg-white overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative h-[300px] md:h-[380px] w-full pt-16 sm:pt-20 overflow-hidden">
          <motion.div
            className="absolute inset-0 w-full h-full"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "linear" }}
          >
            <img
              src={abouthero}
              alt="About Banner"
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-black/50" />

          <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-white text-3xl md:text-4xl font-bold tracking-wide">
                Tentang Kami
              </h1>
              <div className="h-1 w-20 bg-red-600 mx-auto mt-4 rounded-full"></div>
            </motion.div>
          </div>
        </section>

        {/* Perjalanan Kami Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6 uppercase">
              PERJALANAN KAMI DALAM MEMBANGUN KEPERCAYAAN
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              Perjalanan PT. Pusat Solis Dapick Dengan akses kepada tim
              "Certified Music Teacher" yang terampil dan berpengalaman, kami
              berkomitmen memberikan pengalaman belajar musik yang mendalam.
              Kami menempatkan belajar kepada kolaborasi dan inspirasi untuk
              pengembangan talent yang berbakat. Guru yang berdedikasi
              menggunakan Program Afiliasi Kami Gabunglah dengan mitra yang
              direkomendasikan oleh Guru kami yang mampu memberikan motivasi dan
              mendorong setiap siswa untuk mencapai potensi maksimal mereka
              dengan penuh keyakinan.
            </p>
          </motion.div>

          {/* Membangun Momen Section */}
          <div className="grid md:grid-cols-2 gap-8 items-center mb-16 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <img
                src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600"
                alt="Music Learning"
                className="rounded-lg shadow-lg w-full h-64 object-cover transform hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-4 uppercase">
                MEMBANGUN MOMEN, MENGABADIKAN KENANGAN
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Musik bukan hanya tentang not dan melodi — tetapi tentang
                menciptakan momen bermakna. Kami percaya dalam memupuk
                lingkungan dimana setiap siswa, terlepas dari usia atau tingkat
                pengalaman, dapat menemukan kebahagiaan dalam belajar musik.
                Dari pelajaran individu hingga pertunjukkan grup yang meriah,
                kami menciptakan kesempatan bagi siswa untuk terhubung,
                berkolaborasi, dan membangun kenangan yang akan bertahan seumur
                hidup.
              </p>
            </motion.div>
          </div>

          {/* Kepercayaan dalam Kualitas Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-bold text-gray-800 text-center mb-12 uppercase"
            >
              KEPERCAYAAN DALAM KUALITAS KAMI
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Users className="w-12 h-12 text-orange-500" />,
                  title: "Pengalaman",
                  desc: "Lebih dari 7 tahun mengajarkan dan menginspirasi siswa dengan metode pembelajaran yang terbukti efektif dan menyenangkan",
                },
                {
                  icon: <Award className="w-12 h-12 text-orange-500" />,
                  title: "Kualitas",
                  desc: "Instruktur musik berkualitas dan berpengalaman dengan sertifikasi yang terakreditasi dan teruji",
                },
                {
                  icon: <Lightbulb className="w-12 h-12 text-orange-500" />,
                  title: "Inovasi",
                  desc: "Mengintegrasikan dengan pembelajaran modern yang disesuaikan dengan kebutuhan setiap siswa",
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  whileHover={{ y: -10 }}
                  className="text-center p-6 border border-red-500 rounded-lg hover:shadow-xl transition-all duration-300 bg-white"
                >
                  <div className="flex justify-center mb-4">{item.icon}</div>
                  <h4 className="text-xl font-bold text-gray-800 mb-3">
                    {item.title}
                  </h4>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Siswa Kami Marquee Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="mb-20"
          >
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-10 uppercase">
              SISWA KAMI
            </h2>
            <div className="relative overflow-hidden">
              <div className="flex animate-marquee whitespace-nowrap hover:[animation-play-state:paused]">
                {marqueeStudents.map((student, index) => (
                  <div
                    key={`${student.id}-${index}`}
                    className="px-6 flex-shrink-0"
                  >
                    <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-orange-500 shadow-md transform hover:scale-110 transition-transform duration-300 cursor-pointer">
                      <img
                        src={student.image}
                        alt={student.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Temukan Kami Section */}
          <div className="grid md:grid-cols-2 gap-12 items-start overflow-hidden">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-6 uppercase">
                TEMUKAN KAMI DI SINI
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Terbuka Di Pusat Kota Depok Dengan akses kepada tim "Certified
                Music Teacher" yang terampil dan berpengalaman, kami berkomitmen
                memberikan pengalaman belajar musik yang mendalam.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Kami menjunjung tinggi nilai-nilai kesopanan, kejujuran. Kami
                berharap bahwa suasana belajar yang positif ini akan membantu
                para siswa berkembang tidak hanya sebagai musisi tetapi juga
                sebagai individu yang percaya diri dan kreatif.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="rounded-lg overflow-hidden shadow-lg h-96 border border-gray-200"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d826.6!2d106.8220071!3d-6.4007864!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69eb001b2e5001%3A0xaffaa524164ed186!2sShema%20Music!5e1!3m2!1sid!2sid!4v1705596000000!5m2!1sid!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Google Maps Location"
              ></iframe>
            </motion.div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default About;
