import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from "react-qr-code";
import axios from 'axios';
import html2canvas from 'html2canvas'; // 1. Import library
import './MemberCard.css';
import BASE_URL from '../api'; // Import the URL

const MemberCard = () => {
  const { id } = useParams();
  const [member, setMember] = useState(null);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/members/${id}`);
        setMember(res.data);
      } catch (error) {
        console.error("Error fetching member", error);
      }
    };
    fetchMember();
  }, [id]);

  if (!member) return <div className="text-center mt-10">Loading ID Card...</div>;

  const qrValue = `http://your-website.com/member/${member.uniqueId}`;

  // Function to print (PDF/Paper)
  const handlePrint = () => {
    window.print();
  };

  // Function to download as Image (JPG/PNG)
  const handleDownload = async () => {
    const element = document.getElementById('printable-card'); // Target the specific card
    
    if (element) {
      const canvas = await html2canvas(element, {
        useCORS: true, // IMPORTANT: Allows loading images from external URLs (Cloudinary/S3)
        scale: 2,      // Increases resolution (2x) for better quality on phones
        backgroundColor: null // Ensures transparent corners if PNG
      });

      // Create a fake link to trigger download
      const link = document.createElement('a');
      link.download = `${member.name.replace(/\s+/g, '_')}_ID_Card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className="id-card-wrapper flex-col">
      
      {/* 2. Add ID="printable-card" to the card container */}
      <div className="id-card" id="printable-card">
        <div className="card-header"></div>
        
        <div className="photo-container">
            {/* Note: useCORS requires the server hosting the image to allow Access-Control-Allow-Origin */}
            <img 
              src={member.photoUrl || "https://via.placeholder.com/150"} 
              alt={member.name} 
              crossOrigin="anonymous" // Helps with CORS image handling
            />
        </div>

        <div className="card-info">
            <h2 className="member-name">{member.name}</h2>
            <span className="member-domain">{member.domain}</span>
            <div className="contact-info">
              <p>{member.email}</p>
            </div>
        </div>

        <div className="qr-section">
            <div className="qr-box">
                <QRCode
                size={90}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                value={qrValue}
                viewBox={`0 0 256 256`}
                />
            </div>
            <p className="scan-text">Scan to Verify Identity</p>
        </div>
      </div>

      {/* Action Buttons Area */}
      <div className="action-buttons mt-8 flex gap-4">
        
        {/* Print Button */}
        <button onClick={handlePrint} className="print-btn bg-gray-800 hover:bg-gray-900">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Print / PDF
        </button>

        {/* Download Button */}
        <button onClick={handleDownload} className="print-btn bg-blue-600 hover:bg-blue-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download Image
        </button>
      </div>

    </div>
  );
};

export default MemberCard;
