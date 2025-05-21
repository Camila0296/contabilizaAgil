import React from 'react';

const Home: React.FC = () => (
  <div className="container py-5">
    <h2 className="mb-4" style={{ color: 'var(--primary)' }}>Bienvenido al Panel Contable</h2>
    <div className="row g-4">
      <div className="col-md-4">
        <div className="card text-center shadow-sm">
          <div className="card-body">
            <h5 className="card-title" style={{ color: 'var(--secondary)' }}>Resumen Financiero</h5>
            <p className="card-text">Ingresos: <strong>$50,000</strong></p>
            <p className="card-text">Egresos: <strong>$30,000</strong></p>
            <p className="card-text">Balance: <strong style={{ color: 'var(--accent)' }}>$20,000</strong></p>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card text-center shadow-sm">
          <div className="card-body">
            <h5 className="card-title" style={{ color: 'var(--secondary)' }}>Facturación</h5>
            <p className="card-text">Gestiona tus facturas y recibos fácilmente.</p>
            <button className="btn btn-primary">Ir a Facturación</button>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card text-center shadow-sm">
          <div className="card-body">
            <h5 className="card-title" style={{ color: 'var(--secondary)' }}>Reportes</h5>
            <p className="card-text">Genera reportes contables y financieros.</p>
            <button className="btn btn-success">Ver Reportes</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Home;