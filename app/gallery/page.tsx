import { SiteFooter, SiteNav } from "@/components/SiteChrome";

export const metadata = {
  title: "Gallery | Los Jefes Taco Catering",
  description: "Event photo placeholders for Los Jefes taco catering."
};

export default function GalleryPage() {
  return (
    <main>
      <SiteNav />
      <section className="section gallerySection pageSection" id="gallery">
        <div className="sectionHeading reveal">
          <p className="eyebrow">Event gallery</p>
          <h1>Photos will bring the taquiza to life.</h1>
          <p>
            These placeholders are ready for real setup shots, taco closeups,
            salsa tables, aguas frescas, and happy guest moments once you start
            posting.
          </p>
        </div>
        <div className="galleryGrid">
          <article className="galleryTile galleryTall reveal">
            <span>Setup photo</span>
            <strong>Serving station</strong>
          </article>
          <article className="galleryTile reveal">
            <span>Food photo</span>
            <strong>Tacos on the plancha</strong>
          </article>
          <article className="galleryTile reveal">
            <span>Drink photo</span>
            <strong>Aguas frescas</strong>
          </article>
          <article className="galleryTile reveal">
            <span>Details photo</span>
            <strong>Salsa bar</strong>
          </article>
          <article className="galleryTile galleryWide reveal">
            <span>Event photo</span>
            <strong>Guests enjoying Los Jefes</strong>
          </article>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
