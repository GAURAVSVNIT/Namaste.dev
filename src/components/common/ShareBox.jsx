import { useEffect, useRef, useState } from "react";
import "@/static/common/shareModal.css";

export default function ShareModal({ isOpen, onClose, copyLink, whatsappMessage, title, subtitle }) {
  const modalRef = useRef();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = () => {
    copyToClipboard();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(copyLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="share-modal-overlay">
      <div className="share-modal" ref={modalRef}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2 className="modal-title">{title}</h2>
        <p className="modal-subtitle">{subtitle}</p>

        <div className="social-row">
          <a
            className="social-btn"
            href={`https://wa.me/?text=${encodeURIComponent(whatsappMessage + " " + copyLink)}`}
            target="_blank"
            rel="noreferrer"
          >
            <img src="/images/socialmediaSvg/whatsapp.svg" alt="WhatsApp" />
            <span>WhatsApp</span>
          </a>

          <a
            className="social-btn"
            href="https://www.instagram.com/direct/inbox/"
            target="_blank"
            rel="noreferrer"
          >
            <img src="/images/socialmediaSvg/instagram.svg" alt="Instagram" />
            <span>Instagram</span>
          </a>
        </div>

        <button className="copy-btn" onClick={handleCopy}>
          {copied ? "Link Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}
