import React from "react";
import Header from '../components/Header/Header';
import '../assets/styles/prices.css';
import { useNavigate } from 'react-router-dom';

const priceList = [
    {
        category: "Eye Treatments",
        description: "Refectocil professional-quality eyelash and eyebrow tinting styling products. They have been the leading brand in the industry for over 70 years, typically lasting 4-6 weeks.",
        items: [
            { name: "Eyebrow shape", time: "15 mins", price: "$25" },
            { name: "Eyebrow tint", time: "15 mins", price: "$25" },
            { name: "Eyebrow tint & shape", time: "30 mins", price: "$40" },
            { name: "Eyelash tint", time: "15 mins", price: "$30" },
            { name: "Eyelash, eyebrow tint & shape", time: "30 mins", price: "$50" },
            { name: "Eyelash lift & tint", time: "45 mins", price: "$80" },
        ],
    },
    {
        category: "Nails",
        description: "Discover CND the global leader in professional nail care. With award winning, science backed products.",
        items: [
            { name: "File & Paint", time: "30 mins", price: "$40" },
            { name: "Gel nails", time: "45 mins", price: "$65" },
            { name: "Gel removal + reapplication", time: "60 mins", price: "$75" },
            { name: "Spa manicure", time: "60 mins", price: "$75" },
            { name: "Spa manicure with paraffin mask", time: "75 mins", price: "$90" },
            { name: "Gel nails & gel toes", time: "90 mins", price: "$120" },
        ],
        extra: [
            "Indulge in a luxurious treatment that includes a relaxing soak, detailed cuticle care, precise nail filing, exfoliation, a nourishing mask, and a soothing massage. Finish with your choice of polish, leaving your hands or feet looking beautiful and feeling refreshed.",
            "Paraffin masks deeply hydrate and soften the skin while boosting circulation and relieving joint stiffness. Perfect for soothing tired hands and feet, leaving them smooth, supple, and refreshed.",
        ],
    },
    {
        category: "Toes",
        items: [
            { name: "Spa pedicure", time: "60 mins", price: "$85" },
            { name: "Spa pedicure with paraffin mask", time: "90 mins", price: "$95" },
            { name: "Gel toes", time: "60 mins", price: "$65" },
        ],
    },
    {
        category: "Waxing",
        items: [
            { name: "Half leg", time: "30 min", price: "$45" },
            { name: "Full Leg", time: "45 min", price: "$55" },
            { name: "Bikini", time: "30+ min", price: "$40+" },
            { name: "Underarm", time: "30 min", price: "$30" },
            { name: "Arms", time: "30 min", price: "$35" },
            { name: "Upper Lip", time: "15 min", price: "$20" },
            { name: "Chin", time: "15 min", price: "$20" },
            { name: "Lip and Chin", time: "30 min", price: "$35" },
        ],
    },
    {
        category: "Facials",
        description: "Joyce Blok – New Zealand's First Locally Developed Beauty Therapy Brand. Celebrating over 50 years of caring for Kiwi skin, Joyce Blok is proudly formulated to meet the unique demands of our climate and skincare needs. Our products are kind to your skin and gentle on the environment.",
        items: [
            {
                name: "Mini Express",
                time: "30 min",
                price: "$65",
                description: "Perfect for busy people on the run. This treatment includes cleansing, exfoliation and a mask selected to suit the needs of your skin all while being pampered and your skin thanking you for it.",
            },
            {
                name: "Total Bliss",
                time: "60 min",
                price: "$100",
                description: "A made to measure treatment to suit your skins needs. Including cleansing toner, exfoliation facial, neck & foot massage. A mask especially selected to rebalance & nourish your skin for a refreshed, revitalised complexion.",
            },
            {
                name: "Antioxidant Thermal",
                time: "75 min",
                price: "$115",
                description: "Fight the environmental changes that contribute to premature ageing by neutralising those harmful free radicals with this restorative facial. leaving your skin and you feeling totally pampered.",
            },
        ],
    },
    {
        category: "Massage",
        items: [
            {
                name: "Aromatherapy massage",
                time: "60 min",
                price: "$90",
                description: "A simple yet powerful massage this technique has multiple benefits from the eight specific oils used in combination, Back, feet and head.",
            },
            { 
                name: "Swedish massage - Half body", 
                time: "30 min", 
                price: "$65",
                description: "A Swedish massage is a popular type of therapeutic massage known for its relaxation and stress relieving benefits. It uses long gliding strokes, kneading, and circular movements to help relax muscles and improve circulation."
            },
            { 
                name: "Swedish massage - Full body", 
                time: "60 min", 
                price: "$90",
                description: "A Swedish massage is a popular type of therapeutic massage known for its relaxation and stress relieving benefits. It uses long gliding strokes, kneading, and circular movements to help relax muscles and improve circulation."
            },
            { name: "Foot massage", time: "20 min", price: "$50" },
            { name: "Head massage", time: "20 min", price: "$50" },
        ],
    },
    {
        category: "Cosmetic Tattoo",
        description: "Powder Brows is a cosmetic tattoo technique that delivers a soft, powdered makeup look to the eyebrows. Using a machine and fine needle, pigment is gently implanted into the skin, creating fuller, more defined brows. This semi-permanent treatment suits most skin types and can significantly reduce the time spent on daily brow makeup. A similar technique can also be used for enhancing lips and eyeliner.",
        extra: [
            "Consultation: Before your cosmetic tattoo, we'll have a quick chat to go over your goals, choose the right shape and colour, and make sure you're fully informed."
        ],
        items: [
            { name: "Consultation", time: "", price: "Free" },
            { name: "Ombre / Powder brows", time: "", price: "$550" },
            { name: "Top liner", time: "", price: "$350" },
            { name: "Bottom liner", time: "", price: "$250" },
            { name: "Top & Bottom Liner", time: "", price: "$550" },
            { name: "Lips - Full colour", time: "", price: "$550" },
            { name: "6 Week Touch up", time: "", price: "$100" },
            { name: "18-month Colour boost", time: "", price: "$300" },
            { name: "24+ month Colour boost", time: "", price: "POA" },
        ],
    },
    {
        category: "Gift Vouchers",
        description: "Gift vouchers are available for all treatments or your choice of value. Perfect for birthdays, anniversaries, or just to show someone you care.",
        extra: [
            "Gift vouchers can be purchased in person or online through the booking form. They make a thoughtful gift for any occasion, allowing your loved ones to choose their preferred treatments.",
            "You can add in the comments section of the booking form if you want a hard copy and can pick up or an email gift voucher."
        ],
        items: [
            { name: "Gift Voucher", time: "", price: "$25+" },
        ]
    }
];

export default function PriceList() {
    const navigate = useNavigate();
    return (
        <div className="price-list-container">
            <Header />
            <div className="price-list-content">
                <h1>Price List</h1>
                {priceList.map((section) => (
                    <div key={section.category} className="price-section">
                        <h2>{section.category}</h2>
                        {section.description && (
                            <p className="section-description">{section.description}</p>
                        )}
                        
                        <table className="price-table">
                            <tbody>
                                {section.items.map((item, idx) => (
                                    <React.Fragment key={item.name + idx}>
                                        <tr>
                                            <td className="service-name">{item.name}</td>
                                            <td className="service-time">{item.time}</td>
                                            <td className="service-price">{item.price}</td>
                                        </tr>
                                        {item.description && (
                                            <tr>
                                                <td colSpan="3" className="service-description">
                                                    {section.category === "Massage" ? (
                                                        <><strong>Includes:</strong> {item.description}</>
                                                    ) : (
                                                        item.description
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>

                        {section.extra && section.extra.map((txt, i) => (
                            <p key={i} className="extra-info">{txt}</p>
                        ))}
                    </div>
                ))}

                <div className="footer-notes">
                    <p>
                        <strong>Cancellations:</strong> If you wish to cancel your appointment please give 24 hours' notice, otherwise a 50% fee will apply.
                    </p>
                    <button
                        className="cta-button"
                        onClick={() => navigate('/book')}
                        aria-label="Book an appointment"
                    >
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
}