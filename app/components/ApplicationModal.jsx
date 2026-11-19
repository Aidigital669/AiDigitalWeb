"use client";

import React, { useState } from "react";
import { isValidEmail, isValidMobileNumber, isValidName } from "../../lib/validation";

export default function ApplicationModal({ isOpen, onClose, jobTitle, jobDescription }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    message: ""
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      const cleaned = value.replace(/[^a-zA-Z\s]/g, "");
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrorMessage("Resume file size must be less than 5MB.");
        setResumeFile(null);
        e.target.value = null;
      } else {
        setErrorMessage("");
        setResumeFile(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isValidName(formData.name)) {
      setStatus("error");
      setErrorMessage("Please enter a valid name (at least 2 letters).");
      return;
    }
    if (!isValidEmail(formData.email)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!isValidMobileNumber(formData.phone)) {
      setStatus("error");
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!resumeFile) {
      setStatus("error");
      setErrorMessage("Please upload your resume.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("phone", formData.phone);
      submitData.append("address", formData.address);
      submitData.append("city", formData.city);
      submitData.append("district", formData.district);
      submitData.append("message", formData.message);
      submitData.append("jobTitle", jobTitle);
      submitData.append("resume", resumeFile);

      const res = await fetch("/api/apply", {
        method: "POST",
        body: submitData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit application.");
      }

      setStatus("success");
      
      if (typeof window !== "undefined") {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "job_application_success",
          jobTitle: jobTitle
        });
      }

    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        background: "#ffffff",
        width: "100vw",
        height: "100vh",
        overflowY: "auto",
        padding: "40px",
        position: "relative",
      }}>
        <button 
          onClick={onClose}
          style={{
            position: "absolute",
            top: "24px",
            right: "24px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "24px",
            color: "#64748b"
          }}
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "60px" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a", marginBottom: "12px" }}>
            Apply for {jobTitle}
          </h2>
          
          {jobDescription && (
            <div style={{ backgroundColor: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "32px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#334155", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Role Overview</h4>
              <p style={{ fontSize: "16px", color: "#64748b", lineHeight: "1.6", margin: 0 }}>
                {jobDescription}
              </p>
            </div>
          )}

        {status === "success" ? (
          <div style={{
            backgroundColor: "#F0FDF4",
            border: "1px solid #BBF7D0",
            color: "#166534",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "center",
            marginBottom: "16px"
          }}>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>Application Submitted!</h3>
            <p>Thank you for applying to BizzMaker. We will review your profile and contact you shortly.</p>
            <button 
              onClick={onClose}
              className="btn-card-solid"
              style={{ marginTop: "20px" }}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {status === "error" && (
              <div style={{ padding: "12px 16px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderRadius: "8px", fontSize: "14px", fontWeight: "500", marginBottom: "20px" }}>
                {errorMessage}
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px", color: "#334155" }}>Full Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                disabled={status === "submitting"}
                style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "16px" }}
              />
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px", color: "#334155" }}>Email Address</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  disabled={status === "submitting"}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "16px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px", color: "#334155" }}>Phone Number</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  required
                  disabled={status === "submitting"}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "16px" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px", color: "#334155" }}>Address</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main Street, Area"
                required
                disabled={status === "submitting"}
                style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "16px" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px", color: "#334155" }}>City</label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Pune"
                  required
                  disabled={status === "submitting"}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "16px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px", color: "#334155" }}>District</label>
                <input
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="e.g. Pune"
                  required
                  disabled={status === "submitting"}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "16px" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px", color: "#334155" }}>Resume / CV (PDF or Word)</label>
              <input
                type="file"
                name="resume"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                required
                disabled={status === "submitting"}
                style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px dashed #94a3b8", fontSize: "16px", background: "#f8fafc", cursor: "pointer" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px", color: "#334155" }}>Cover Letter / Additional Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us why you're a great fit for this role..."
                rows="4"
                disabled={status === "submitting"}
                style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "16px", resize: "vertical" }}
              />
            </div>

            <button 
              type="submit" 
              disabled={status === "submitting"}
              className="btn-card-solid"
              style={{ width: "100%", padding: "16px", fontSize: "18px", marginTop: "16px", background: "#2563EB", fontWeight: "700" }}
            >
              {status === "submitting" ? "Submitting Application..." : "Submit Application"}
            </button>
          </form>
        )}
        </div>
      </div>
    </div>
  );
}
