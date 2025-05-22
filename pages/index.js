import { useState } from 'react';

const PIXELS = 16;
const PIXEL_SIZE = 20;

// Placeholder for purchased pixels
const boughtPixels = {}; // will be filled with IDs and names

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedPixel, setSelectedPixel] = useState(null);
  const pixels = Array.from({ length: PIXELS * PIXELS }, (_, i) => i);

  const buyPixel = async (index) => {
  if (boughtPixels[index]) return;

  try {
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pixelId: index }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert('Error creando la sesión de pago.');
    }
  } catch (error) {
    console.error('Error al iniciar compra:', error);
    alert('Error conectando con Stripe.');
  }
};

  return (
    <div className="page">
      <header className="header">
                <div className="menu-icon with-margin"><div></div><div></div><div></div></div>
        <h1 className="title">ZÉRO PEXEL</h1>
        <button className="top-button">acquire zéro</button>
      </header>

      <main className="container">
        <p className="subtitle">A single activated pixel in a vast 16k void</p>

        <section className="manifesto">
          <p>Zéro is not a concept. It’s not a statement. it’s a pixel.</p>
          <p>Positioned precisely. Authenticated. Owned. Limited.</p>
        </section>

        <div className="divider" />

        <section className="grid-wrapper">
          <div className="pixel-grid">
            {pixels.map((_, i) => (
              <div
                key={i}
                className={`pixel ${
                  boughtPixels[i] ? 'bought' : selectedPixel === i ? 'active' : ''
                }`}
                title={boughtPixels[i] || ''}
                onClick={() => buyPixel(i)}
              />
            ))}
          </div>
        </section>

        <section className="details">
          <h2>WHAT YOU RECEIVE</h2>
          <p>One 16K image (.png) with a unique activated pixel</p>
          <p>Metadata-embedded proof of authenticity</p>
          <p>Digital signature (SHA256)</p>
          <p>Private delivery link</p>
          <p>Public registration of coordinates and ownership</p>

          <h2>OWNERSHIP</h2>
          <p>There is only one ZÉRO. There will not be another.</p>
          <p>Your ownership will be logged publicly at zeropexel.com/registry</p>
          <p>Ownership is not transferable. Copies are meaningless. Proof is everything.</p>

          <h2>FAQ</h2>
          <p><strong>Q: What is this?</strong> A: It is exactly what it is.</p>
          <p><strong>Q: Why is it so expensive?</strong> A: Because there’s only one. </p>
          <p><strong>Q: Can I resell it?</strong> A: No. You don’t resell ZÉRO. You just have it.</p>
          <p><strong>Q: Can I copy the file?</strong> A: Yes. You can copy a photo of a diamond, too.</p>
          <p><strong>Q: Is it an NFT?</strong> A: No. This exists.</p>
        </section>

        <footer>
          <button className="buy-button">acquire zéro</button>
        </footer>
      </main>
    </div>
  );
}
