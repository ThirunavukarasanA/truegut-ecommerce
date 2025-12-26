import React from "react";
import SectionHeading from "@/components/Common/SectionHeading";
import Image from "next/image";
import Link from "next/link";

const BLOGS = [
  {
    id: 1,
    title: "Green onion knife and salad placed",
    description:
      "Lorem Ipsum is simply dummy text of the printing industry. Lorem Ipsum daler...",
    date: "AUG-2023",
    image: "/images/blog-salad.png",
  },
  {
    id: 2,
    title: "Fresh organic brand and picnic",
    description:
      "Lorem Ipsum is simply dummy text of the printing industry. Lorem Ipsum daler...",
    date: "SEP-2023",
    image: "/images/blog-veg.png",
  },
  {
    id: 3,
    title: "Health and skin for your organic",
    description:
      "Lorem Ipsum is simply dummy text of the printing industry. Lorem Ipsum daler...",
    date: "OCT-2023",
    image: "/images/blog-nuts.png",
  },
];

export default function BlogSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <SectionHeading
          subheading="ARTICLES AND NEWS"
          heading="Updated story"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BLOGS.map((blog) => (
            <div key={blog.id} className="group cursor-pointer">
              <div className="relative aspect-[4/3] w-full overflow-hidden mb-6">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-white text-font-title text-[10px] font-bold px-3 py-1 uppercase tracking-wider">
                  {blog.date}
                </div>
              </div>

              <div className="text-center px-4">
                <h3 className="text-base font-bold text-font-title mb-3 group-hover:text-primary transition-colors">
                  {blog.title}
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-4">
                  {blog.description}
                </p>
                <Link
                  href={`/blog/${blog.id}`}
                  className="text-primary text-xs font-bold border-b border-primary/30 pb-1 hover:text-secondary hover:border-secondary transition-colors inline-block uppercase"
                >
                  READ MORE
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
