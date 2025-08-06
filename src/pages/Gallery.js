import '../assets/styles/gallery.css';

const gallerySections = [
  {
    title: "Eyeliner Treatments",
    description: "Professional eyeliner cosmetic tattooing results",
    images: [
      { src: "/images/reducedPics/eyeliner.webp", alt: "Eyeliner cosmetic tattoo result" },
      { src: "/images/reducedPics/eyeliner1.webp", alt: "Eyeliner cosmetic tattoo close-up" }
    ]
  },
  {
    title: "Powder Brows",
    description: "Before and after powder brow treatments",
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
    description: "Lash lift and tint transformations",
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
    description: "Cosmetic tattoo lip blushing results",
    images: [
      { src: "/images/reducedPics/tattoolips.webp", alt: "Lip blushing result" },
      { src: "/images/reducedPics/tattoolips1.webp", alt: "Lip blushing side view" },
      { src: "/images/reducedPics/tattoolips2.webp", alt: "Lip blushing close-up" }
    ]
  }
];

function Gallery() {
  return (
    <>
      <div className="gallery-banner">
      </div>
      <div className="gallery-container">
        <main className="gallery-main">
          <h1 className="gallery-title">My Beauty Gallery</h1>
          <p className="gallery-intro">Explore my work and see the transformations I create</p>

          {gallerySections.map((section, index) => (
            <section key={index} className="gallery-section">
              <h2 className="section-title">{section.title}</h2>
              <p className="section-description">{section.description}</p>

              {section.beforeAfter && (
                <div className="before-after-container">
                  {section.beforeAfter.map((item, idx) => (
                    <div key={idx} className="before-after-pair">
                      <div className="comparison-image">
                        <img
                          src={item.before}
                          alt={`Before ${item.alt}`}
                          loading="lazy"
                        />
                        <span className="comparison-label">Before</span>
                      </div>
                      <div className="comparison-image">
                        <img
                          src={item.after}
                          alt={`After ${item.alt}`}
                          loading="lazy"
                        />
                        <span className="comparison-label">After</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.images && (
                <div className="image-grid">
                  {section.images.map((image, idx) => (
                    <div key={idx} className="gallery-image-container">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="gallery-image"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </main>
      </div>
    </>
  );
}

export default Gallery;
