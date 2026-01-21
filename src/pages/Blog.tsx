import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import blogDummy from "../data/blogDummy";
import { BlogCard } from "../components/BlogCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import hero from "../assets/hero-image.png";

const Blog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  useEffect(() => {
    const handleResize = () => {
      // Jika layar < 640px (small/mobile), set 5 item per halaman
      if (window.innerWidth < 640) {
        setItemsPerPage(5);
      } else {
        // Desktop/Tablet: 15 item per halaman
        setItemsPerPage(15);
      }
    };

    // Set initial layout
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalPages = Math.ceil(blogDummy.length / itemsPerPage);

  // Reset page if we go out of bounds after resize
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBlogs = blogDummy.slice(startIndex, startIndex + itemsPerPage);

  const goPrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const goNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <MainLayout>
      {/* HERO / BANNER */}
      <section className="relative h-[300px] md:h-[380px] w-full">
        <img
          src={hero}
          alt="Blog Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-white text-3xl md:text-4xl font-bold tracking-wide">
            BLOG
          </h1>
          <p className="text-white/90 mt-2 max-w-2xl text-sm md:text-base">
            Tips, tutorial, dan inspirasi seputar dunia musik untuk perjalanan
            belajar Anda
          </p>
        </div>
      </section>

      {/* FEATURED BLOG — ONLY MD UP */}
      <section className="hidden md:block w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col gap-8">
          {blogDummy.slice(0, 1).map((blog) => (
            <div
              key={blog.id}
              className="flex flex-col md:flex-row bg-white rounded-xl shadow-md overflow-hidden"
            >
              {/* IMAGE */}
              <div className="md:w-1/3 h-[260px]">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* CONTENT */}
              <div className="flex flex-col p-6 md:w-2/3">
                {/* META */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-3">
                  <span>{blog.date}</span>
                  <span>•</span>
                  <span>{blog.author}</span>
                  <span>•</span>
                  <span className="text-red-600 font-medium">
                    {blog.category}
                  </span>
                </div>

                {/* TITLE */}
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                  {blog.title}
                </h2>

                {/* DESCRIPTION */}
                <div className="flex-1 overflow-hidden">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {blog.description}
                  </p>
                </div>

                {/* BUTTON */}
                <div className="mt-6">
                  <a
                    href={`/blog/${blog.id}`}
                    className="inline-block px-6 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition"
                  >
                    Baca Selengkapnya
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BLOG LIST */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-5
            gap-6
            justify-items-center
          "
        >
          {currentBlogs.map((blog) => (
            <BlogCard key={blog.id} {...blog} />
          ))}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-14">
            {/* PREV */}
            <button
              onClick={goPrev}
              disabled={currentPage === 1}
              className={`w-9 h-9 flex items-center justify-center rounded-md border transition
                ${
                  currentPage === 1
                    ? "text-gray-300 border-gray-200 cursor-not-allowed"
                    : "hover:bg-gray-100"
                }`}
            >
              <ChevronLeft size={18} />
            </button>

            {/* PAGE NUMBER */}
            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-md text-sm font-medium transition
                    ${
                      currentPage === page
                        ? "bg-red-600 text-white"
                        : "border hover:bg-gray-100"
                    }`}
                >
                  {page}
                </button>
              );
            })}

            {/* NEXT */}
            <button
              onClick={goNext}
              disabled={currentPage === totalPages}
              className={`w-9 h-9 flex items-center justify-center rounded-md border transition
                ${
                  currentPage === totalPages
                    ? "text-gray-300 border-gray-200 cursor-not-allowed"
                    : "hover:bg-gray-100"
                }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </section>
    </MainLayout>
  );
};

export default Blog;
