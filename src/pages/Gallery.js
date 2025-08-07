import '../assets/styles/gallery.css';

const gallerySections = [
  {
    title: "Eyeliner Treatments",
    description: "Professional eyeliner cosmetic tattooing results that enhance your natural beauty",
    images: [
      { src: "/images/reducedPics/eyeliner.webp", alt: "Eyeliner cosmetic tattoo result" },
      { src: "/images/reducedPics/eyeliner1.webp", alt: "Eyeliner cosmetic tattoo close-up" }
    ]
  },
  {
    title: "Powder Brows",
    description: "Transform your brows with our signature powder brow technique",
    beforeAfter: [
      {
        before: "/images/reducedPics/powderbrowbefore.webp",
        after: "/images/reducedPics/powderbrowafter.webp",
        alt: "Powder brows transformation"
      },
      {
        before: "/images/reducedPics/powderbrow1before.webp",
        after: "/images/reducedPics/powderbrow1after.webp",
        alt: "Powder brows close-up transformation"
      }
    ]
  },
  {
    title: "Lash Lift & Tint",
    description: "Natural-looking lash enhancements that open up your eyes",
    beforeAfter: [
      {
        before: "/images/reducedPics/liftandtint+shapebefore.webp",
        after: "/images/reducedPics/liftandtint+shapeafter.webp",
        alt: "Lash lift and tint transformation"
      }
    ]
  },
  {
    title: "Lip Blushing",
    description: "Subtle lip enhancement that gives you the perfect pout",
    images: [
      { src: "/images/reducedPics/tattoolips.webp", alt: "Lip blushing result" },
      { src: "/images/reducedPics/tattoolips1.webp", alt: "Lip blushing side view" },
      { src: "/images/reducedPics/tattoolips2.webp", alt: "Lip blushing close-up" }
    ]
  }
];

function Gallery() {
  return (
    <div className="gallery-page">
      <div className="gallery-container">
        <main className="gallery-main">
          {gallerySections.map((section, index) => (
            <section key={index} className="gallery-section">
              <div className="section-header">
                <h2 className="section-title">{section.title}</h2>
                <p className="section-description">{section.description}</p>
              </div>

              {section.beforeAfter && (
                <div className="before-after-container">
                  {section.beforeAfter.map((item, idx) => (
                    <div key={idx} className="before-after-card">
                      <div className="comparison-wrapper">
                        <div className="comparison-image before">
                          <img
                            src={item.before}
                            alt={`Before ${item.alt}`}
                            loading="lazy"
                          />
                          <div className="comparison-overlay">
                            <span className="comparison-label">Before</span>
                          </div>
                        </div>
                        <div className="comparison-image after">
                          <img
                            src={item.after}
                            alt={`After ${item.alt}`}
                            loading="lazy"
                          />
                          <div className="comparison-overlay">
                            <span className="comparison-label">After</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.images && (
                <div className="image-gallery">
                  {section.images.map((image, idx) => (
                    <div key={idx} className="gallery-card">
                      <div className="image-wrapper">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="gallery-image"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}

export default Gallery;
