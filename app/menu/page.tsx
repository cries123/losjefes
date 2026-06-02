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
          Los Jefes
        </Link>
        <div className="navLinks">
          <Link href="/">Home</Link>
          <Link href="/#booking">Book Catering</Link>
          <Link href="/#contact">Contact</Link>
        </div>
      </nav>

      <section className="menuHero">
        <div className="menuHeroCopy reveal">
          <p className="eyebrow">Catering menu</p>
          <h1>Pick two meats. We bring the full taco spread.</h1>
          <p>
            Every catering package includes four tacos per guest, rice and beans
            on the side, fresh garnishes, red and green salsas, and a
            complimentary choice of horchata or jamaica.
          </p>
          <Link className="button primary" href="/#booking">
            Start Booking
          </Link>
        </div>
        <div className="menuHeroPoster reveal" aria-hidden="true">
          <span>2 meats</span>
          <strong>4 tacos</strong>
          <em>rice + beans + drink</em>
        </div>
      </section>

      <section className="section meatMenuSection">
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
                <span>Photo placeholder</span>
                <strong>{String(index + 1).padStart(2, "0")}</strong>
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

      <section className="section includedSection">
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
    </main>
  );
}
