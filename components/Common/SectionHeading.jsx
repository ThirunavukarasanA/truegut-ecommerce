import React from "react";

export default function SectionHeading({ subheading, heading }) {
  return (
    <div className="text-center mb-10 md:mb-16">
      <h4 className="text-primary font-bold text-xs uppercase tracking-widest mb-2">
        {subheading}
      </h4>
      <h2 className="text-3xl md:text-4xl font-bold text-font-title">
        {heading}
      </h2>
    </div>
  );
}
