import React from "react";
import { FaTruck, FaShieldAlt } from "react-icons/fa";
import { GiMasonJar } from "react-icons/gi";

const TrueGutProtocol = () => {
  const steps = [
    {
      id: 1,
      title: "1. LOCAL LAB DISPATCH",
      description: "Freshly sourced locally", // Placeholder text based on image
      icon: <FaTruck size={32} />,
    },
    {
      id: 2,
      title: "2. HOME FERMENTATION",
      description: "Know exactly what's inside", // Placeholder text
      icon: <GiMasonJar size={32} />,
    },
    {
      id: 3,
      title: "3. BIOLOGICAL HEALING",
      description: "Bio-active benefits", // Placeholder text
      icon: <FaShieldAlt size={32} />,
    },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-xl md:text-2xl font-jark font-medium text-gray-500 uppercase tracking-widest">
            The TrueGut Protocol
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step) => (
            <div
              key={step.id}
              className="bg-white rounded-3xl p-8 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              {/* Icon Container */}
              <div className="mb-6 relative">
                {/* Outer Ring Effect */}
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                  {/* Inner Circle */}
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white shadow-inner">
                    {step.icon}
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <h3 className="text-lg font-bold font-jark italic text-primary mb-2 uppercase tracking-wide">
                {step.title}
              </h3>
              <p className="text-gray-400 italic text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrueGutProtocol;
