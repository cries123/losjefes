"use client";

import Link from "next/link";

const navLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/gallery", label: "Gallery" },
  { href: "/faq", label: "FAQ" },
  { href: "/booking", label: "Book Catering" },
  { href: "/contact", label: "Contact" }
];

function BrandLogo() {
  return (
    <span className="brandLogo" aria-hidden="true">
      <span className="brandLogoHat" />
      <span className="brandLogoFace">LJ</span>
    </span>
  );
}

export function SiteNav() {
  return (
    <nav className="nav">
      <Link className="brand" href="/" aria-label="Los Jefes home">
        <BrandLogo />
        <span>Los Jefes</span>
      </Link>
      <div className="navLinks">
        {navLinks.map((link) => (
          <Link href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="siteFooter">
      <div className="footerBrand">
        <Link className="brand footerLogo" href="/" aria-label="Los Jefes home">
          <BrandLogo />
          <span>Los Jefes</span>
        </Link>
        <p>
          Weekend taquiza catering with tacos, rice, beans, salsas, and aguas
          frescas.
        </p>
      </div>
      <div className="footerColumns">
        <div>
          <h3>Explore</h3>
          <Link href="/menu">Menu</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/faq">FAQ</Link>
        </div>
        <div>
          <h3>Book</h3>
          <Link href="/booking">Catering estimator</Link>
          <Link href="/contact">Contact us</Link>
          <span>Saturday & Sunday events</span>
        </div>
        <div>
          <h3>Social</h3>
          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer">
            TikTok
          </a>
          <span>Replace with your real handles</span>
        </div>
        <div>
          <h3>Service Area</h3>
          <span>Paso Robles to Santa Barbara</span>
          <span>Further travel available for an added expense</span>
        </div>
      </div>
    </footer>
  );
}
