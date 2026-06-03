import Link from "next/link";
import { DRINK_OPTIONS, INCLUDED_SIDES, MEAT_MENU_ITEMS } from "@/lib/menu";

export const metadata = {
  title: "Menu | Los Jefes Taco Catering",
  description:
    "Explore Los Jefes catering meats, sides, and complimentary aguas frescas."
};

export default function MenuPage() {
  return (
    <main className="menuPage">
      <div className="menuBackdrop" aria-hidden="true">
        <span className="menuBlob menuBlobOne" />
        <span className="menuBlob menuBlobTwo" />
        <span className="menuBlob menuBlobThree" />
        <span className="menuGridPattern" />
      </div>

      <nav className="nav menuNav">
        <Link className="brand" href="/" aria-label="Los Jefes home">
          <span className="brandLogo" aria-hidden="true">
            <span className="brandLogoHat" />
            <span className="brandLogoFace">LJ</span>
          </span>
          <span>Los Jefes</span>
        </Link>
        <div className="navLinks">
          <Link href="/">Home</Link>
          <Link href="/#booking">Book Catering</Link>
          <Link href="/#contact">Contact</Link>
        </div>
      </nav>

      <section className="menuHero mexicanMenuHero">
        <div className="papelBanner papelBannerEdge menuPapel" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="menuHeroCopy reveal">
          <p className="eyebrow">Catering menu</p>
          <h1>Pick two meats for a proper taquiza.</h1>
          <p>
            Every catering package includes four tacos per guest, rice and beans
            on the side, fresh garnishes, red and green salsas, and a
            complimentary choice of horchata or jamaica.
          </p>
          <Link className="button primary" href="/#booking">
            Start Booking
          </Link>
        </div>
        <div className="menuHeroPoster mexicanArchCard reveal" aria-hidden="true">
          <div className="agaveMark posterAgave"><span /><span /><span /></div>
          <span>2 meats</span>
          <strong>4 tacos</strong>
          <em>rice + beans + drink</em>
        </div>
      </section>

      <div className="talaveraDivider menuTileDivider" aria-hidden="true" />

      <section className="section meatMenuSection mexicanMenuSection">
        <div className="menuSectionHeading reveal">
          <p className="eyebrow">Meat lineup</p>
          <h2>Three classics, styled for catering.</h2>
        </div>
        <div className="meatMenuGrid">
          {MEAT_MENU_ITEMS.map((item, index) => (
            <article className="meatMenuCard reveal" key={item.name}>
              <div
                className={`meatPhoto meatPhoto-${item.slug}`}
                role="img"
                aria-label={item.photoLabel}
              >
                <span>Photo coming soon</span>
                <strong>{String(index + 1).padStart(2, "0")}</strong>
                <em>Replace with real catering photo</em>
              </div>
              <div className="meatMenuCopy">
                <p className="eyebrow">Meat option</p>
                <h2>{item.name}</h2>
                <p>{item.description}</p>
                <div className="meatTags">
                  <span>Rice + beans</span>
                  <span>Drink choice</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section includedSection mexicanIncluded">
        <div className="includedPanel reveal">
          <p className="eyebrow">Included with every meat choice</p>
          <h2>Not just tacos. A complete side-and-drink setup.</h2>
          <div className="includedLists">
            <div>
              <h3>Sides</h3>
              <ul>
                {INCLUDED_SIDES.map((side) => (
                  <li key={side}>{side}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Complimentary drink</h3>
              <p>Choose {DRINK_OPTIONS.join(" or ")} for the event.</p>
            </div>
            <div>
              <h3>Salsa bar</h3>
              <p>Two red salsas and two green salsas with limes, onions, and cilantro.</p>
            </div>
          </div>
          <Link className="button primary" href="/#booking">
            Build My Estimate
          </Link>
        </div>
      </section>
      <footer className="siteFooter">
        <div className="footerBrand">
          <Link className="brand footerLogo" href="/" aria-label="Los Jefes home">
            <span className="brandLogo" aria-hidden="true">
              <span className="brandLogoHat" />
              <span className="brandLogoFace">LJ</span>
            </span>
            <span>Los Jefes</span>
          </Link>
          <p>Save this page for meat options, sides, drinks, and future catering photos.</p>
        </div>
        <div className="footerColumns">
          <div>
            <h3>Explore</h3>
            <Link href="/">Home</Link>
            <Link href="/#gallery">Gallery</Link>
            <Link href="/#faq">FAQ</Link>
          </div>
          <div>
            <h3>Book</h3>
            <Link href="/#booking">Catering estimator</Link>
            <Link href="/#contact">Contact us</Link>
            <span>Saturday & Sunday events</span>
          </div>
          <div>
            <h3>Social</h3>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer">TikTok</a>
            <span>Replace with your real handles</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
