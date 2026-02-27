import React, { useState, useEffect } from 'react';
import { Mail, MapPin, Phone, Facebook, Twitter, Instagram, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Types
interface LicenseData {
  name: string;
  fatherName: string;
  cnic: string;
  licenseNo: string;
  branch: string;
  type: string;
  category: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  photoUrl: string;
}

export default function PublicPortal() {
  const [cnic, setCnic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LicenseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const formatCNIC = (val: string) => {
    let value = val.replace(/\D/g, '');
    if (value.length > 5 && value.length <= 12) {
      value = value.slice(0, 5) + '-' + value.slice(5);
    } else if (value.length > 12) {
      value = value.slice(0, 5) + '-' + value.slice(5, 12) + '-' + value.slice(12, 13);
    }
    return value;
  };

  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNIC(e.target.value);
    setCnic(formatted);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/licenses/search/${cnic}`);
      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        setError('No record found for this CNIC.');
      }
    } catch (err) {
      setError('An error occurred while searching.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f6f8]">
      {/* Banner / Hero Section */}
      <section 
        className="h-[32vh] md:h-[40vh] bg-cover bg-center relative overflow-hidden flex flex-col"
        style={{ backgroundImage: "url('https://qtp.gob.pk/static/media/TP%20(1).eb084def24c6a22f579e.png')" }}
      >
        {/* Navy Blue Overlay */}
        <div className="absolute inset-0 bg-[#0b4b78]/70 backdrop-contrast-125"></div>
        
        {/* Header elements inside banner */}
        <div className="relative z-20 flex justify-between items-start px-4 pt-6 md:px-10 md:pt-10">
          <img 
            src="https://qtp.gob.pk/static/media/Nav_logo.2dec820e3e2d5541a67f.png" 
            alt="Logo" 
            className="h-16 md:h-24 object-contain"
          />
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white mt-2">
            <Menu className="w-9 h-9 md:w-12 md:h-12" strokeWidth={2.5} />
          </button>
        </div>

        {/* Banner Title */}
        <div className="flex-1 flex items-center justify-center relative z-10 px-4">
          <h1 className="text-white text-[30px] sm:text-[42px] md:text-[60px] font-[800] uppercase tracking-[0.5px] text-center leading-none whitespace-nowrap">
            LICENSE VERIFICATION
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 flex justify-center py-8 px-4">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div 
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-[450px] bg-white rounded-[15px] shadow-[0_20px_40px_rgba(0,0,0,0.08)] overflow-hidden h-fit"
            >
              <div className="bg-linear-to-br from-[#0054ba] to-[#002655] text-white text-center text-2xl font-bold leading-[60px]">
                License Verification
              </div>
              <div className="p-8 md:px-10 text-center">
                <form onSubmit={handleSearch}>
                  <input 
                    type="text" 
                    placeholder="Enter CNIC Number" 
                    maxLength={15}
                    value={cnic}
                    onChange={handleCnicChange}
                    className="w-full px-5 py-3.5 rounded-full border border-[#e0e0e0] mb-6 text-base outline-none focus:border-[#0b3d91]"
                  />

                  <div className="bg-[#f9f9f9] border border-[#dcdcdc] p-4 rounded-md text-left mb-6 flex items-center gap-3">
                    <input type="checkbox" className="w-4.5 h-4.5" required />
                    <label className="text-sm text-slate-600">I'm not a robot</label>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="bg-[#0b3d91] text-white px-10 py-3.5 rounded-full text-lg font-semibold shadow-[0_6px_15px_rgba(11,61,145,0.3)] hover:bg-[#124ea3] transition-all disabled:opacity-70"
                  >
                    {loading ? "Verifying..." : "Verify"}
                  </button>
                </form>
                {error && <p className="mt-4 text-red-500 text-sm font-medium">{error}</p>}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-[92%] max-w-[850px] bg-white rounded-[16px] shadow-[0_6px_18px_rgba(16,24,40,0.08)] p-[22px_20px] h-fit relative ml-[24px]"
            >
              {/* Profile Avatar & Close Button */}
              <div className="absolute -top-[16px] -right-[40px] z-20">
                <div className="relative">
                  <img 
                    src={result.photoUrl} 
                    alt="Profile" 
                    className="w-[72px] h-[72px] object-cover rounded-[10px] border border-slate-200 shadow-[0_6px_16px_rgba(0,0,0,0.12)]"
                    referrerPolicy="no-referrer"
                  />
                  <button 
                    onClick={() => setResult(null)}
                    className="absolute -top-[10px] -right-[10px] w-[34px] h-[34px] bg-[#c0392b] text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-700 transition-colors"
                  >
                    <X size={20} strokeWidth={3} />
                  </button>
                </div>
              </div>

              {/* Result Header */}
              <div className="flex items-center gap-[12px] mb-[14px]">
                <div className="flex-shrink-0 w-[100px] h-[100px] overflow-hidden flex items-center">
                  <img 
                    src="https://qtp.gob.pk/static/media/Nav_logo.2dec820e3e2d5541a67f.png" 
                    alt="Logo" 
                    className="h-full w-auto max-w-none object-cover object-left scale-[1.3] translate-x-[10px]"
                  />
                </div>
                <div className="min-w-0 flex flex-col justify-center">
                  <h2 className="text-[20px] font-[700] text-[#123e72] leading-[1.1] uppercase tracking-tight">
                    {result.name}
                  </h2>
                  <div className="text-[15px] mt-1 text-[#667085] font-normal">
                    <div className="flex items-center gap-1">
                      <span>License</span>
                      <span className="ml-1">:</span>
                      <span className="text-[#c62828] font-bold ml-1">{result.licenseNo}</span>
                    </div>
                    <p className="leading-none mt-1">Number</p>
                  </div>
                </div>
              </div>

              <div className="h-[1px] bg-[#edeef2] my-[14px]"></div>

              {/* Details Grid */}
              <div className="space-y-[18px] mt-4">
                <DetailRow label={["Father/ Husband", "Name"]} value={result.fatherName} />
                <DetailRow label="CNIC" value={result.cnic} />
                <DetailRow label="Branch" value={result.branch} isCapitalized={true} />
                <DetailRow label="License Type" value={result.type} />
                <DetailRow label={["License", "Category"]} value={result.category} />
                <DetailRow label="Date Issue" value={result.issueDate} valueColor="text-[#11a17b]" />
                <DetailRow label="Expiry Date" value={result.expiryDate} valueColor="text-[#b73535]" />
                <DetailRow label="License Status" value={result.status} isCapitalized={true} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-linear-to-br from-[#0054ba] to-[#002655] text-white py-6">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex-shrink-0">
            <img 
              src="https://qtp.gob.pk/static/media/footerLogo.ff0bc941e45bc87aaa1f.png" 
              alt="Footer Logo" 
              className="h-16 md:h-20"
            />
          </div>

          <div className="text-center flex-1">
            <div className="flex justify-center gap-4 mb-4 text-sm font-medium">
              <a href="#" className="hover:underline">FM 88.6</a>
              <a href="#" className="hover:underline">Contact Us</a>
              <a href="#" className="hover:underline">Offices</a>
            </div>
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 mb-4 text-sm">
              <span className="flex items-center gap-2">
                <Mail size={16} /> info@qtp.gob.pk
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={16} /> Quetta
              </span>
              <span className="flex items-center gap-2">
                <Phone size={16} /> +92-819213316
              </span>
            </div>
            <p className="text-xs opacity-80">
              © 2023 Balochistan Traffic Police – Quetta Traffic Police Services
            </p>
          </div>

          <div className="flex gap-4">
            <a href="#" className="hover:opacity-80"><Facebook size={24} /></a>
            <a href="#" className="hover:opacity-80"><Twitter size={24} /></a>
            <a href="#" className="hover:opacity-80"><Instagram size={24} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DetailRow({ 
  label, 
  value, 
  valueColor = "text-[#0b4b78]", 
  isCapitalized = false 
}: { 
  label: string | string[], 
  value: string, 
  valueColor?: string,
  isCapitalized?: boolean
}) {
  return (
    <div className="grid grid-cols-[150px_20px_1fr] items-start text-[19px] font-normal">
      <div className="text-[#1a3353] leading-tight">
        {Array.isArray(label) ? (
          <>
            <div>{label[0]}</div>
            <div>{label[1]}</div>
          </>
        ) : (
          label
        )}
      </div>
      <div className="text-[#1a3353] flex justify-center">:</div>
      <div className={cn(
        "tracking-tight pl-1", 
        valueColor,
        !isCapitalized && "uppercase"
      )}>
        {isCapitalized ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : value}
      </div>
    </div>
  );
}
