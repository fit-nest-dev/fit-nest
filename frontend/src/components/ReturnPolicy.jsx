import React from "react";

const ReturnPolicy = () => {
  const containerStyle = {
    backgroundColor: "#000",
    color: "#fff",
    minHeight: "100vh",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    overflowY: "auto",
    fontFamily: "Arial, sans-serif",
  };

  const headerStyle = {
    fontSize: "2.5rem",
    fontWeight: "extrabold",
    marginBottom: "30px",
    textAlign: "center",
    color: "#fff",
  };

  const contentStyle = {
    maxWidth: "80%",
    lineHeight: "1.8",
    textAlign: "justify",
    fontSize: "1rem",
    padding: "20px",
    backgroundColor: "#000",
    borderRadius: "8px",
    boxShadow: "0px 4px 6px rgba(18, 72, 7, 0.84)",
  };

  const sectionHeaderStyle = {
    fontSize: "1.25rem",
    fontWeight: "bold",
    marginTop: "25px",
    marginBottom: "10px",
    color: "#fff",
    display: "inline-block",
  };

  const sectionContentStyle = {
    marginBottom: "15px",
    lineHeight: "1.6",
  };

  const listStyle = {
    margin: "10px 0",
    paddingLeft: "20px",
    listStyleType: "disc", // Added this to ensure bullet points are visible
  };

  const contactLinkStyle = {
    color: "#00ff7f",
    textDecoration: "underline",
    cursor: "pointer",
  };

  return (
  <div style={containerStyle}>
    <h1 style={headerStyle}>Return Policy</h1>
    <div style={contentStyle}>
      <div style={sectionContentStyle}>
        <span style={sectionHeaderStyle}>Returns</span>
        <p>
          Our policy lasts 10 days. If 10 days have gone by since your purchase,
          unfortunately, we can’t offer you a refund or exchange.
        </p>
        <ul style={listStyle}>
          <li>
            To be eligible for a return, your item must be unused and in the same
            condition that you received it.
          </li>
          <li>It must also be in the original packaging.</li>
        </ul>
      </div>

      <div style={sectionContentStyle}>
        <span style={sectionHeaderStyle}>Refunds</span>
        <p>
          Once your return is received and inspected, we will notify you via email
          regarding the approval or rejection of your refund.
        </p>
        <ul style={listStyle}>
          <li>
            If approved, the refund will be processed to your original payment
            method within 5–7 business days.
          </li>
          <li>
            If you haven’t received a refund yet, check with your bank or credit
            card company as processing times can vary.
          </li>
        </ul>
        <p>
          For further assistance, email us at{" "}
          <span style={contactLinkStyle}>fitnest.patna@gmail.com</span>.
        </p>
      </div>

      <div style={sectionContentStyle}>
        <span style={sectionHeaderStyle}>Exchanges</span>
        <p>
          We replace items only if they are defective or damaged and reported
          within 5 days of receipt. For exchange, email us at{" "}
          <span style={contactLinkStyle}>fitnest.patna@gmail.com</span>.
        </p>
      </div>

      <div style={sectionContentStyle}>
        <span style={sectionHeaderStyle}>Shipping</span>
        <p>
          The product will be shipped within 3-4 days and will be delivered within
          1-2 days.
        </p>
        <p>
          To return your product, email it to:{" "}
          <a href="mailto:fitnest.patna@gmail.com">fitnest.patna@gmail.com</a>
        </p>
        <address>
          Fit Nest, 3rd Floor, Sisodia Palace, East Boring Canal Road, Shree
          Krishna Puri, Patna, Bihar 800001
        </address>
        <ul style={listStyle}>
          <li>Shipping costs are non-refundable.</li>
          <li>
            For items over ₹1,000/-, consider using a trackable shipping service
            or purchasing shipping insurance.
          </li>
        </ul>
      </div>
    </div>
  </div>
);
};

export default ReturnPolicy;
