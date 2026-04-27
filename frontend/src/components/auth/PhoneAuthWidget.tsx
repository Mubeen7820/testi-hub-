import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';

// Comprehensive list of countries
const COUNTRIES = [
  { code: 'US', dialCode: '+1', name: 'United States', length: 10 },
  { code: 'GB', dialCode: '+44', name: 'United Kingdom', length: 10 },
  { code: 'IN', dialCode: '+91', name: 'India', length: 10 },
  { code: 'AU', dialCode: '+61', name: 'Australia', length: 9 },
  { code: 'CA', dialCode: '+1', name: 'Canada', length: 10 },
  { code: 'DE', dialCode: '+49', name: 'Germany', length: 11 },
  { code: 'FR', dialCode: '+33', name: 'France', length: 9 },
  { code: 'IT', dialCode: '+39', name: 'Italy', length: 10 },
  { code: 'ES', dialCode: '+34', name: 'Spain', length: 9 },
  { code: 'BR', dialCode: '+55', name: 'Brazil', length: 11 },
  { code: 'JP', dialCode: '+81', name: 'Japan', length: 10 },
  { code: 'CN', dialCode: '+86', name: 'China', length: 11 },
  { code: 'RU', dialCode: '+7', name: 'Russia', length: 10 },
  { code: 'ZA', dialCode: '+27', name: 'South Africa', length: 9 },
  { code: 'MX', dialCode: '+52', name: 'Mexico', length: 10 },
  { code: 'AE', dialCode: '+971', name: 'United Arab Emirates', length: 9 },
  { code: 'SG', dialCode: '+65', name: 'Singapore', length: 8 },
  { code: 'NZ', dialCode: '+64', name: 'New Zealand', length: 9 },
  { code: 'IE', dialCode: '+353', name: 'Ireland', length: 9 },
  { code: 'SE', dialCode: '+46', name: 'Sweden', length: 9 }
].sort((a, b) => a.name.localeCompare(b.name));

export const PhoneAuthWidget: React.FC<{ isSignUp?: boolean }> = ({ isSignUp }) => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES.find(c => c.code === 'US')!);
  const [phoneDigits, setPhoneDigits] = useState<string[]>(Array(10).fill(''));
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const phoneInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Adjust phone digits array length when country changes
  useEffect(() => {
    setPhoneDigits(prev => {
      const newDigits = Array(selectedCountry.length).fill('');
      for (let i = 0; i < Math.min(prev.length, newDigits.length); i++) {
        newDigits[i] = prev[i];
      }
      return newDigits;
    });
  }, [selectedCountry]);

  const handlePhoneDigitChange = (index: number, value: string) => {
    const newDigits = [...phoneDigits];
    
    // Handle pasting multi-digit number
    if (value.length > 1) {
      const pasted = value.replace(/[^0-9]/g, '').slice(0, selectedCountry.length).split('');
      const updated = [...phoneDigits];
      pasted.forEach((char, i) => {
        if (i < selectedCountry.length) updated[i] = char;
      });
      setPhoneDigits(updated);
      const nextIdx = Math.min(pasted.length, selectedCountry.length - 1);
      phoneInputRefs.current[nextIdx]?.focus();
      return;
    }

    newDigits[index] = value;
    setPhoneDigits(newDigits);

    if (value && index < selectedCountry.length - 1) {
      phoneInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePhoneDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!phoneDigits[index] && index > 0) {
        phoneInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      phoneInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < selectedCountry.length - 1) {
      phoneInputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      const allFilled = phoneDigits.every(d => d !== '');
      if (allFilled) {
        e.preventDefault();
        handleRequestOtp();
      }
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    const newDigits = [...otpDigits];
    // Handle pasting multi-digit code
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('');
      const updated = [...otpDigits];
      pasted.forEach((char, i) => {
        if (i < 6) updated[i] = char;
      });
      setOtpDigits(updated);
      const nextIdx = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIdx]?.focus();
      return;
    }

    newDigits[index] = value;
    setOtpDigits(newDigits);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      const allFilled = otpDigits.every(d => d !== '');
      if (allFilled) {
        e.preventDefault();
        handleVerifyOtp();
      }
    }
  };

  const handleRequestOtp = async () => {
    const phoneNumber = phoneDigits.join('');
    if (phoneNumber.length !== selectedCountry.length) {
      toast.error(`Please enter a valid ${selectedCountry.length}-digit phone number`);
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading('Sending OTP...');
    try {
      // In a real app we might prepend dialCode, but our mock backend just takes the string
      const fullPhone = `${selectedCountry.dialCode}${phoneNumber}`;
      const { data } = await api.post('/auth/phone/request', { phone: fullPhone });
      toast.success(`OTP Sent! Your mock code is: ${data.code}`, { 
        id: toastId, 
        duration: 10000 
      });
      setIsOtpSent(true);
      // Give DOM time to render OTP inputs before focusing
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send OTP', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the full 6-digit OTP');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading('Verifying OTP...');
    try {
      const fullPhone = `${selectedCountry.dialCode}${phoneDigits.join('')}`;
      const { data } = await api.post('/auth/phone/verify', { phone: fullPhone, code: otpCode });
      setAuth(data.user, data.accessToken);
      toast.success('Successfully logged in!', { id: toastId });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mt-4">
      {!isOtpSent ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex flex-row gap-2 items-center justify-center flex-nowrap w-full">
            {/* Country Selector */}
            <div className="relative w-[110px] shrink-0">
              <select
                value={selectedCountry.code}
                onChange={(e) => {
                  const country = COUNTRIES.find(c => c.code === e.target.value);
                  if (country) setSelectedCountry(country);
                }}
                className="w-full appearance-none bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-md py-2.5 pl-2 pr-6 text-[13px] font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-sm"
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.dialCode})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Digit Boxes */}
            <div className="flex flex-nowrap gap-1 sm:gap-1.5 justify-center sm:justify-start">
              {phoneDigits.map((digit, index) => (
                <input
                  key={`phone-${index}`}
                  ref={el => phoneInputRefs.current[index] = el}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    handlePhoneDigitChange(index, val);
                  }}
                  onKeyDown={(e) => handlePhoneDigitKeyDown(index, e)}
                  disabled={isLoading}
                  className="w-6 h-10 sm:w-7 sm:h-11 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-md text-center text-[14px] font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleRequestOtp}
            disabled={isLoading || phoneDigits.some(d => d === '')}
            className="w-full bg-[#101828] hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold rounded-md py-3 transition-all shadow-sm disabled:opacity-50 active:scale-[0.98] text-[15px]"
          >
            {isLoading ? 'Sending...' : 'Get OTP'}
          </button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="text-center">
            <p className="text-[14px] text-gray-500 dark:text-slate-400 mb-4">
              Enter the 6-digit code sent to {selectedCountry.dialCode} {phoneDigits.join('')}
            </p>
            
            <div className="flex justify-center gap-1.5 sm:gap-2">
              {otpDigits.map((digit, index) => (
                <input
                  key={`otp-${index}`}
                  ref={el => otpInputRefs.current[index] = el}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    handleOtpDigitChange(index, val);
                  }}
                  onKeyDown={(e) => handleOtpDigitKeyDown(index, e)}
                  disabled={isLoading}
                  className="w-7 h-9 sm:w-8 sm:h-10 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-md text-center text-[14px] font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all shadow-sm"
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsOtpSent(false)}
              disabled={isLoading}
              className="px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-semibold rounded-md transition-all hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 text-[14px]"
            >
              Back
            </button>
            <button
              onClick={handleVerifyOtp}
              disabled={isLoading || otpDigits.some(d => d === '')}
              className="flex-1 bg-[#101828] hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold rounded-md py-3 transition-all shadow-sm disabled:opacity-50 active:scale-[0.98] text-[15px]"
            >
              {isLoading ? 'Verifying...' : (isSignUp ? 'Verify & Sign Up' : 'Verify & Sign In')}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
