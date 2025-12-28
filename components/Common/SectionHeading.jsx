import React from "react";

export default function SectionHeading({ subheading, heading }) {
  return (
    <div className="text-center mb-10 md:mb-16">
      <h4 className="text-primary font-bold text-xs uppercase tracking-widest mb-2">
        {subheading}
      </h4>
      <h2 className="text-xl md:text-2xl font-jark font-medium text-gray-500 uppercase tracking-widest">
        {heading}
      </h2>
    </div>
  );
}
