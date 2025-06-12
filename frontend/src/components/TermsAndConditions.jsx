import React from "react";

const TermsAndConditions = () => {
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
    padding: "15px",
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
    listStyleType: "disc", // Bullet point style
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Terms and Conditions</h1>
      <div style={contentStyle}>
        <div style={sectionContentStyle}>
          <span style={sectionHeaderStyle}>Introduction</span>
          <p>
            FIT-NEST.IN This website is operated by Fit Nest. By using or accessing this Website, you agree to these terms and conditions. If you don’t agree to these terms & conditions, please don’t use or access this Website. Fit Nest may change these terms and conditions from time to time, so you should check these terms and conditions regularly.
          </p>
        </div>

        <div style={sectionContentStyle}>
          <span style={sectionHeaderStyle}>Collection of Visitor Information</span>
          <p>
            Any information collected at the Sites is governed by our Privacy Policy, unless otherwise stated. To access and use certain services available through the Sites, you may be required to register with Fit Nest through a login/registration page and you must agree to be bound by any additional applicable terms and conditions contained there.
          </p>
        </div>

        <div style={sectionContentStyle}>
          <span style={sectionHeaderStyle}>Payment Obligations</span>
          <ul style={listStyle}>
            <li>All MEMBERSHIP fees are non-refundable but transferable with an active MEMBERSHIP and amount payable as decided by the CLUB.</li>
            <li>MEMBER agrees that failure to use the CLUB facilities shall not release them from the obligation to make all payments required by the terms of this Membership Agreement.</li>
          </ul>
        </div>

        <div style={sectionContentStyle}>
          <span style={sectionHeaderStyle}>Membership Agreement</span>
          <ul style={listStyle}>
            <li>MEMBER needs to share a soft copy of their government issued identity card for verification.</li>
            <li>Standard Gym MEMBERSHIP includes 1 visit per day to a maximum of 2 hours of workout. Additional charges will apply for more time or visits.</li>
            <li>MEMBER agrees not to engage in any commercial or business activity inside the facilities.</li>
            <li>MEMBER agrees to abide by all membership regulations of the CLUB, including dress code.</li>
          </ul>
        </div>

        <div style={sectionContentStyle}>
          <span style={sectionHeaderStyle}>Behavior Guidelines</span>
          <ul style={listStyle}>
            <li>MEMBER agrees not to use loud or profane language or engage in any form of harassment.</li>
            <li>MEMBER agrees to follow all safety instructions and behave courteously towards staff and other members.</li>
          </ul>
        </div>

        <div style={sectionContentStyle}>
          <span style={sectionHeaderStyle}>Drugs and Steroids</span>
          <p>
            MEMBER understands that the CLUB prohibits the use of any drugs or steroids and agrees not to use them at the CLUB premises. The CLUB or its employees do not promote the use of any kind of drugs or steroids.
          </p>
        </div>

        <div style={sectionContentStyle}>
          <span style={sectionHeaderStyle}>Liabilities</span>
          <ul style={listStyle}>
            <li>Fit Nest is not responsible for any theft or loss of personal belongings.</li>
            <li>Members acknowledge the inherent risks of injury or ill health from using the CLUB's services and agree to participate at their own risk.</li>
            <li>Parking in and around the CLUB premises is the sole responsibility of the MEMBER.</li>
          </ul>
        </div>

        <div style={sectionContentStyle}>
          <span style={sectionHeaderStyle}>Termination of Membership</span>
          <ul style={listStyle}>
            <li>All members must clear any dues within 10 days of the due date; late fees will be charged if overdue.</li>
            <li>If dues are not cleared within 20 days, membership may be terminated.</li>
            <li>Termination of membership may require a new membership package with additional charges.</li>
          </ul>
        </div>

        <div style={sectionContentStyle}>
          <span style={sectionHeaderStyle}>Personal Training Terms and Conditions</span>
          <ul style={listStyle}>
            <li>Consult your physician before starting Personal Training sessions.</li>
            <li>There are no guarantees of specific results from Personal Training programs.</li>
            <li>Personal Training sessions will expire when the allotted sessions or validity period ends.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
