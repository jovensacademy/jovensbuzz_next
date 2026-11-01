export function AboutSection() {
  return (
    <section className="about-section-main" id="about" aria-labelledby="aboutSectionMainTitle">
      <div className="container-fluid about-section-main__container">
        <h2 className="about-section-main__title" id="aboutSectionMainTitle" data-aos="fade-up">
          The Creative Power <span className="about-section-main__title-accent">Behind Your Growth.</span>
        </h2>

        <div className="row about-section-main__row">
          <div className="col-12 col-md-6 col-lg-4">
            <article data-tilt="" data-reveal-3d="" className="about-section-main__card about-section-main__card--dark">
              <div>
                <p className="about-section-main__label">Jovens buzz</p>
                <p className="about-section-main__number">6+</p>
              </div>
              <div>
                <h3 className="about-section-main__card-title">Core Social Media Services</h3>
                <p className="about-section-main__text">
                  Strategy, content creation, creative design, short-form video, social media management, and brand
                  identity—all under one roof.
                </p>
              </div>
            </article>
          </div>

          <div className="col-12 col-md-6 col-lg-4">
            <article data-tilt="" data-reveal-3d="" className="about-section-main__card about-section-main__card--light">
              <div>
                <p className="about-section-main__label">Our Approach</p>
                <p className="about-section-main__number">100%</p>
              </div>
              <div>
                <h3 className="about-section-main__card-title">Creative. Strategic. Results-Driven.</h3>
                <p className="about-section-main__text about-section-main__text--narrow">
                  Every post serves a purpose, every design builds brand recognition, and every strategy is focused on
                  meaningful business growth.
                </p>
              </div>
            </article>
          </div>

          <div className="col-12 col-lg-4 about-section-main__stack">
            <article data-tilt="" data-reveal-3d="" className="about-section-main__card about-section-main__card--orange">
              <div>
                <p className="about-section-main__label about-section-main__label--narrow">Projects Delivered</p>
                <p className="about-section-main__number">150+</p>
              </div>
              <div>
                <h3 className="about-section-main__card-title">Social Media Projects</h3>
                <p className="about-section-main__text about-section-main__text--sm">
                  Helping small businesses grow online, boost visibility, and connect with their audience.
                </p>
              </div>
            </article>
            <article
              data-tilt=""
              data-reveal-3d=""
              className="about-section-main__card about-section-main__card--dark about-section-main__card--inline"
            >
              <p className="about-section-main__label">Business Industries</p>
              <p className="about-section-main__number">14+</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
