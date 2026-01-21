import { Link } from "react-router-dom";
import Logo from "../assets/shemalogo.png";
import { Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#8b1d3d] text-white">
      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* LEFT */}
        <div className="space-y-4">
          <img src={Logo} alt="Shema Music" className="h-12" />

          <h3 className="font-semibold text-lg">Hubungi Kami</h3>

          <ul className="text-sm space-y-2 text-white/90">
            <li>
              Jl. Kenanga No.3A, RT 03/RW.08 <br />
              Kec. Pancoran Mas, Depok 16432
            </li>
            <li>📞 0811-1987-622 (Chat Only)</li>
            <li>✉️ shemamusic@gmail.com</li>
          </ul>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          {/* SOCIAL */}
          <div className="flex items-center gap-3">
            <Instagram size={20} />
            <Youtube size={20} />
          </div>

          <h3 className="font-semibold text-lg">Jam Operasional</h3>

          <div className="text-sm space-y-3">
            <div className="flex justify-between border-b border-white/30 pb-1">
              <span>Senin</span>
              <span>10.30 - 18.00 WIB</span>
            </div>

            <div className="flex justify-between border-b border-white/30 pb-1">
              <span>Selasa - Jumat</span>
              <span>10.30 - 20.00 WIB</span>
            </div>

            <div className="flex justify-between">
              <span>Minggu</span>
              <span>Tutup</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="bg-[#7a1834]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p className="text-white/80">
            © 2017–{new Date().getFullYear()} Shema Music. Hak Cipta Dilindungi.
          </p>

          <div className="flex gap-5 uppercase text-xs tracking-wide">
            <Link to="/" className="hover:underline">
              Beranda
            </Link>
            <Link to="/registration" className="hover:underline">
              Daftar Kursus
            </Link>
            <Link to="/blog" className="hover:underline">
              Blog
            </Link>
            <Link to="/about" className="hover:underline">
              Tentang Kami
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
