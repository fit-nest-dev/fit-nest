import React from "react";

const CodeOfConduct = () => {
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
    padding: "25px",
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
      <h1 style={headerStyle}>Code of Conduct</h1>
      <div style={contentStyle}>
        <div style={sectionContentStyle}>
          <span style={sectionHeaderStyle}>General Guidelines</span>
          <ul style={listStyle}>
            <li>It is necessary that all members wear appropriate, clean attire and footwear when in Fit Nest.</li>
            <li>Members cannot train in the club without a hand towel.</li>
            <li>In the interest of hygiene, members must wipe down each piece of equipment after use.</li>
            <li>Outside footwear is strictly not permitted inside the club / shoes permitted inside should be clean and tidy.</li>
            <li>No sandals, jeans, string vests, or open-toed shoes are to be worn. Tops must be worn at all times in the club.</li>
          </ul>
        </div>

        <div style={sectionContentStyle}>
          <span style={sectionHeaderStyle}>Equipment Usage</span>
          <ul style={listStyle}>
            <li>A member using weights, dumbbells, or any other accessories needs to put them back to their defined positions after use.</li>
            <li>Equipment must not be moved, altered, modified, or used in a manner other than that for which it was intended.</li>
            <li>Members must limit their cardiovascular work to 20 minutes on cardio equipment.</li>
            <li>Members should use minimal space and quantity of equipment for workout to allow others too.</li>
          </ul>
        </div>

        <div style={sectionContentStyle}>
          <span style={sectionHeaderStyle}>Club Behavior</span>
          <ul style={listStyle}>
            <li>Members must not shout, use foul or abusive language, or behave in a threatening or intimidating manner towards any other member, visitor, or employee.</li>
            <li>Minimize the use of mobile phones inside club premises.</li>
            <li>This is not a social hour, so minimize your unnecessary talks with any other member or trainer.</li>
            <li>Don’t stare or get too close to anyone and avoid giving free advice unless asked.</li>
          </ul>
        </div>

        <div style={sectionContentStyle}>
          <span style={sectionHeaderStyle}>Safety and Cleanliness</span>
          <ul style={listStyle}>
            <li>Your safety is our prime concern, so please follow all safety instructions as guided by the management.</li>
            <li>Please deposit litter in the bin provided in restrooms and maintain a neat and clean environment.</li>
            <li>Lockers are for temporary use only, so please vacate the locker immediately after use. Members who don’t do so are liable to find their lockers vacant.</li>
          </ul>
        </div>

        <div style={sectionContentStyle}>
          <span style={sectionHeaderStyle}>Club Policies</span>
          <ul style={listStyle}>
            <li>All bags, clothing, and valuables must be put in a locker and nowhere on the floor.</li>
            <li>No food is to be consumed in the club premises. Drinks must be contained in closed plastic vessels.</li>
            <li>Plastic vessels provided in gym premises are just for drinking water, so you’re forbidden to put anything into it for your personal use.</li>
            <li>Playing music or maintaining air-conditioners temperature is the sole responsibility of the management, not the members.</li>
          </ul>
        </div>

        <div style={sectionContentStyle}>
          <span style={sectionHeaderStyle}>Locker Usage</span>
          <ul style={listStyle}>
            <li>Lockers are also available on rentals depending on availability and charges decided.</li>
            <li>Any loss of key or damage to the locker by any member is liable to be fined with an amount decided by the management or could also lead to cancellation of membership.</li>
            <li>Lockers should not be used for contents that are forbidden on club premises.</li>
          </ul>
        </div>

        <div style={sectionContentStyle}>
          <span style={sectionHeaderStyle}>Behavior Guidelines</span>
          <ul style={listStyle}>
            <li>Members must not stare or get too close to others, and avoid giving unsolicited advice.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CodeOfConduct;
