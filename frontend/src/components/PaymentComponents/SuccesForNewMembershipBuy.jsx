import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

/**
 * A component that displays a success page when a user has completed a membership purchase.
 * 
 * This component receives the order ID, user ID, membership type, and payment amount as
 * URL parameters. It displays a success message and the order details.
 * 
 * @returns A JSX element containing the success page.
 */
const SuccessForNewMembershipBuy = () => {
  const navigate = useNavigate();
  const { orderId, userId, type, price } = useParams();
  //  const {invoice_url,userDetails}=useLocation();
  const location = useLocation();
  const { invoice_url, userDetails } = location.state || {};
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px',
        background: '#000000',
        height: '100vh',
        color: '#FFFFFF',
      }}
    >
      <div
        style={{
          background: '#1A1A1A',
          borderRadius: '12px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
          maxWidth: '530px',
          textAlign: 'center',
          padding: '20px',
          border: '1px solid #333',
        }}
      >
        <h1 style={{ fontSize: '2.4rem', marginBottom: '10px', color: '#FFFFFF' }}>
          🎉 Payment Successful! 🎉
        </h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '20px', color: '#CCCCCC' }}>
          Thank you for purchasing our membership!
        </p>
        <div
          style={{
            backgroundColor: '#0D0D0D',
            borderRadius: '8px',
            padding: '15px',
            margin: '20px 0',
            boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.1)',
          }}
        >
          <p
            style={{
              color: '#FFFFFF',
              fontWeight: 'bold',
              marginBottom: '10px',
              display: 'block',
            }}
          >
            Name: <span style={{ color: '#66FF66' }}>{userDetails.first_name + ' ' + userDetails.last_name}</span>
          </p>

          <p
            style={{
              color: '#FFFFFF',
              fontWeight: 'bold',
              marginBottom: '10px',
              display: 'block',
            }}
          >
            Email: <span style={{ color: '#66FF66' }}>{userDetails.email}</span>
          </p>

          <p
            style={{
              color: '#FFFFFF',
              fontWeight: 'bold',
              marginBottom: '10px',
              display: 'block',
            }}
          >
            Membership Type: <span style={{ color: '#66FF66' }}>{type}</span>
          </p>

          <p
            style={{
              color: '#FFFFFF',
              fontWeight: 'bold',
              marginBottom: '10px',
              display: 'block',
            }}
          >
            Payment Amount: <span style={{ color: '#66FF66' }}>₹{price}</span>
          </p>

          <p
            style={{
              color: '#FFFFFF',
              fontWeight: 'bold',
              marginBottom: '10px',
              display: 'block',
            }}
          >
            INVOICE_URL:{' '}
            <span style={{ color: '#66FF66' }}>
              {invoice_url ? (
                <a href={invoice_url} target="_blank" rel="noopener noreferrer" style={{ color: '#66FF66' }}>
                  {invoice_url}
                </a>
              ) : (
                'Not Available'
              )}
            </span>
          </p>
        </div>


        <button
          style={{
            backgroundColor: 'rgba(17, 138, 6, 0.89)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background 0.3s',
          }}
          onClick={() => {
            navigate('/login');
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#55CC55')}
          onMouseOut={(e) => (e.target.style.backgroundColor = 'rgba(17, 138, 6, 0.89)')}
        >
          LOGIN HERE
        </button>
      </div>
    </div>
  );
};

export default SuccessForNewMembershipBuy;
