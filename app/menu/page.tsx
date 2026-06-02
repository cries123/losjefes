import Link from "next/link";
import { DRINK_OPTIONS, INCLUDED_SIDES, MEAT_MENU_ITEMS } from "@/lib/menu";

export const metadata = {
  title: "Menu | Los Jefes Taco Catering",
  description:
    "Explore Los Jefes catering meats, sides, and complimentary aguas frescas."
};

export default function MenuPage() {
  return (
    <main>
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
        <p className="eyebrow">Catering menu</p>
        <h1>Choose two jefe-approved taco meats.</h1>
        <p>
          Every catering package includes four tacos per guest, rice and beans
          on the side, fresh garnishes, red and green salsas, and a
          complimentary choice of agua fresca.
        </p>
      </section>

      <section className="section meatMenuSection">
        <div className="meatMenuGrid">
          {MEAT_MENU_ITEMS.map((item) => (
            <article className="meatMenuCard reveal" key={item.name}>
              <div
                className={`meatPhoto meatPhoto-${item.slug}`}
                role="img"
                aria-label={item.photoLabel}
              >
                <span>Photo placeholder</span>
              </div>
              <div className="meatMenuCopy">
                <p className="eyebrow">Meat option</p>
                <h2>{item.name}</h2>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section includedSection">
        <div className="includedPanel reveal">
          <p className="eyebrow">Included with every meat choice</p>
          <h2>Rice, beans, and a complimentary drink choice.</h2>
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
              <h3>Drinks</h3>
              <p>Complimentary choice of {DRINK_OPTIONS.join(" or ")}.</p>
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
