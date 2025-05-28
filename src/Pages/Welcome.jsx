import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate= useNavigate()

  return (
    <div className="welcome-container">
      
      <header className="header">
        <h1 className="logo">BILLZ</h1>
        <p className="tagline">Smart Billing & Inventory for Shopkeepers</p>
      </header>

      <main className="main-content">
        <h2>Welcome to BILLZ</h2>
        <p>Your one-stop solution to manage products, create bills, and grow your business.</p>

        <div className="features">
          <div className="feature-card">
            <h3>📦 Add Products</h3>
            <p>Manage your inventory with ease. Add products with name, price, and quantity.</p>
          </div>
          <div className="feature-card">
            <h3>🧾 Generate Bills</h3>
            <p>Quickly create and share bills for your customers with itemized details and total amount.</p>
          </div>
          <div className="feature-card">
            <h3>📊 Track Sales</h3>
            <p>Monitor your daily sales and keep your business insights in one place.</p>
          </div>
        </div>

        <div className="cta-buttons">
          <button className="btn signup-btn" onClick={()=>navigate('/signup')}>Sign Up</button>
          <button className="btn login-btn" onClick={()=>navigate('/login')}>Login</button>
        </div>
      </main>
    </div>
  );
};

export default Welcome;
