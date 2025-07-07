import Header from '../components/Header/Header';
import '../assets/styles/gallery.css';
import eyeliner from '../assets/images/beauty pics/eyeliner.png';
import eyeliner1 from '../assets/images/beauty pics/eyeliner1.png';
import liftAfter from '../assets/images/beauty pics/liftandtint+shapeafter.png';
import liftBefore from '../assets/images/beauty pics/liftandtint+shapebefore.png';
import powderBrow1After from '../assets/images/beauty pics/powderbrow1after.png';
import powderBrow1Before from '../assets/images/beauty pics/powderbrow1before.png';
import powderBrowAfter from '../assets/images/beauty pics/powderbrowafter.png';
import powderBrowBefore from '../assets/images/beauty pics/powderbrowbefore.png';
import tattooLips from '../assets/images/beauty pics/tattoolips.png';
import tattooLips1 from '../assets/images/beauty pics/tattoolips1.png';
import tattooLips2 from '../assets/images/beauty pics/tattoolips2.png';

const gallerySections = [
  {
    title: "Eyeliner Treatments",
    description: "Professional eyeliner cosmetic tattooing results",
    images: [
      { src: eyeliner, alt: "Eyeliner cosmetic tattoo result" },
      { src: eyeliner1, alt: "Eyeliner cosmetic tattoo close-up" }
    ]
  },
  {
    title: "Powder Brows",
    description: "Before and after powder brow treatments",
    beforeAfter: [
      { before: powderBrowBefore, after: powderBrowAfter, alt: "Powder brows transformation" },
      { before: powderBrow1Before, after: powderBrow1After, alt: "Powder brows close-up transformation" }
    ]
  },
  {
    title: "Lash Lift & Tint",
    description: "Lash lift and tint transformations",
    beforeAfter: [
      { before: liftBefore, after: liftAfter, alt: "Lash lift and tint transformation" }
    ]
  },
  {
    title: "Lip Blushing",
    description: "Cosmetic tattoo lip blushing results",
    images: [
      { src: tattooLips, alt: "Lip blushing result" },
      { src: tattooLips1, alt: "Lip blushing side view" },
      { src: tattooLips2, alt: "Lip blushing close-up" }
    ]
  }
];

function Gallery() {
  return (        
    <>
      <div className="gallery-banner">
        <Header />
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
                        <img src={item.before} alt={`Before ${item.alt}`} />
                        <span className="comparison-label">Before</span>
                      </div>
                      <div className="comparison-image">
                        <img src={item.after} alt={`After ${item.alt}`} />
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