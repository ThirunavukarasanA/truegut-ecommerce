import React from "react";
import { FaTint, FaLeaf } from "react-icons/fa";

const ProbioticIntelligence = () => {
    const cards = [
        {
            id: 1,
            title: "MILK KEFIR BIOLOGY",
            subtitle: "42+ STRAINS | 32B CFU",
            subtitleColor: "text-orange-600",
            icon: <FaTint size={24} className="text-blue-500" />,
            lists: [
                { label: "L. Acidophilus", text: "Restores gut lining and immune function." },
                { label: "S. Boulardii", text: "Clinically fights pathogenic yeast." },
                { label: "Benefit", text: "70% better nutrient absorption." },
            ]
        },
        {
            id: 2,
            title: "WATER KEFIR CRYSTALS",
            subtitle: "15+ STRAINS | VEGAN PROBIOTIC",
            subtitleColor: "text-blue-500",
            icon: <FaTint size={24} className="text-blue-500" />,
            lists: [
                { label: "L. Casei", text: "Joint health and skin luminosity." },
                { label: "B. Bifidum", text: "Advanced colon detoxification." },
                { label: "Benefit", text: "High Bio-Available Vitamin B12." },
            ]
        },
        {
            id: 3,
            title: "THE SCOBY MOTHER",
            subtitle: "SYMBIOTIC COLONY | ACETIC ACIDS",
            subtitleColor: "text-orange-600",
            icon: <FaLeaf size={24} className="text-orange-600" />, // Using Leaf as distinct icon
            lists: [
                { label: "Gluconacetobacter", text: "Heavy metal detoxification." },
                { label: "Zygosaccharomyces", text: "Liver protection enzymes." },
                { label: "Benefit", text: "High antioxidant metabolic boost." },
            ]
        },
    ];

    return (
        <section className="py-20 ">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Header */}
                <div className="mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold italic text-font-title uppercase tracking-wide">
                        PROBIOTIC INTELLIGENCE
                    </h2>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {cards.map((card) => (
                        <div
                            key={card.id}
                            className="bg-white rounded-4xl p-8 shadow-sm border border-gray-100 h-full flex flex-col hover:shadow-md transition-shadow"
                        >
                            {/* Icon */}
                            <div className="mb-6">
                                {card.icon}
                            </div>

                            {/* Title & Subtitle */}
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-font-title uppercase tracking-tight mb-2">
                                    {card.title}
                                </h3>
                                <p className={`text-xs font-bold uppercase tracking-wider ${card.subtitleColor}`}>
                                    {card.subtitle}
                                </p>
                            </div>

                            {/* List */}
                            <div className="space-y-4">
                                {card.lists.map((item, index) => (
                                    <div key={index} className="text-sm text-gray-500 leading-relaxed">
                                        <span className="font-bold text-gray-700">• {item.label}: </span>
                                        {item.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProbioticIntelligence;
