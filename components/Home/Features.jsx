import React from "react";
import { FiTruck, FiShield, FiCornerUpLeft } from "react-icons/fi";

const FEATURES = [
  {
    icon: <FiTruck size={40} className="text-secondary stroke-[1]" />,
    title: "Free shipping",
    description: "On the other hand, we denounce with righteous dislike",
  },
  {
    icon: <FiShield size={40} className="text-secondary stroke-[1]" />,
    title: "Secure payment",
    description: "On the other hand, we denounce with righteous dislike",
  },
  {
    icon: <FiCornerUpLeft size={40} className="text-secondary stroke-[1]" />,
    title: "30 days return",
    description: "On the other hand, we denounce with righteous dislike",
  },
];

export default function Features() {
  return (
    <section className="py-12 bg-white max-w-7xl mx-auto px-4 border-b border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {FEATURES.map((feature, index) => (
          <div
            key={index}
            className="flex items-center gap-6 p-4 rounded-lg hover:shadow-sm transition-shadow"
          >
            <div className="shrink-0 text-secondary">{feature.icon}</div>
            <div>
              <h3 className="font-bold text-font-title text-sm mb-2 uppercase">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed max-w-[250px]">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
