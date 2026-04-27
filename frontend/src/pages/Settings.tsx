import React, { useState, useEffect } from "react";
import { User, Building2, Save, Upload, Camera, Shield, Mail, Bell, Zap, Download, Clock, Trash2, Eye, EyeOff } from "lucide-react";
import { useTestimonialStore } from "../store/testimonialStore";
import { useAuthStore } from "../store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";

const ALL_COUNTRIES = [
  { code: 'AF', dialCode: '+93', name: 'Afghanistan' },
  { code: 'AL', dialCode: '+355', name: 'Albania' },
  { code: 'DZ', dialCode: '+213', name: 'Algeria' },
  { code: 'AD', dialCode: '+376', name: 'Andorra' },
  { code: 'AO', dialCode: '+244', name: 'Angola' },
  { code: 'AR', dialCode: '+54', name: 'Argentina' },
  { code: 'AM', dialCode: '+374', name: 'Armenia' },
  { code: 'AU', dialCode: '+61', name: 'Australia' },
  { code: 'AT', dialCode: '+43', name: 'Austria' },
  { code: 'AZ', dialCode: '+994', name: 'Azerbaijan' },
  { code: 'BS', dialCode: '+1-242', name: 'Bahamas' },
  { code: 'BH', dialCode: '+973', name: 'Bahrain' },
  { code: 'BD', dialCode: '+880', name: 'Bangladesh' },
  { code: 'BY', dialCode: '+375', name: 'Belarus' },
  { code: 'BE', dialCode: '+32', name: 'Belgium' },
  { code: 'BZ', dialCode: '+501', name: 'Belize' },
  { code: 'BJ', dialCode: '+229', name: 'Benin' },
  { code: 'BT', dialCode: '+975', name: 'Bhutan' },
  { code: 'BO', dialCode: '+591', name: 'Bolivia' },
  { code: 'BA', dialCode: '+387', name: 'Bosnia and Herzegovina' },
  { code: 'BW', dialCode: '+267', name: 'Botswana' },
  { code: 'BR', dialCode: '+55', name: 'Brazil' },
  { code: 'BN', dialCode: '+673', name: 'Brunei' },
  { code: 'BG', dialCode: '+359', name: 'Bulgaria' },
  { code: 'BF', dialCode: '+226', name: 'Burkina Faso' },
  { code: 'BI', dialCode: '+257', name: 'Burundi' },
  { code: 'KH', dialCode: '+855', name: 'Cambodia' },
  { code: 'CM', dialCode: '+237', name: 'Cameroon' },
  { code: 'CA', dialCode: '+1', name: 'Canada' },
  { code: 'CV', dialCode: '+238', name: 'Cape Verde' },
  { code: 'CF', dialCode: '+236', name: 'Central African Republic' },
  { code: 'TD', dialCode: '+235', name: 'Chad' },
  { code: 'CL', dialCode: '+56', name: 'Chile' },
  { code: 'CN', dialCode: '+86', name: 'China' },
  { code: 'CO', dialCode: '+57', name: 'Colombia' },
  { code: 'KM', dialCode: '+269', name: 'Comoros' },
  { code: 'CG', dialCode: '+242', name: 'Congo' },
  { code: 'CR', dialCode: '+506', name: 'Costa Rica' },
  { code: 'HR', dialCode: '+385', name: 'Croatia' },
  { code: 'CU', dialCode: '+53', name: 'Cuba' },
  { code: 'CY', dialCode: '+357', name: 'Cyprus' },
  { code: 'CZ', dialCode: '+420', name: 'Czech Republic' },
  { code: 'DK', dialCode: '+45', name: 'Denmark' },
  { code: 'DJ', dialCode: '+253', name: 'Djibouti' },
  { code: 'DO', dialCode: '+1-809', name: 'Dominican Republic' },
  { code: 'EC', dialCode: '+593', name: 'Ecuador' },
  { code: 'EG', dialCode: '+20', name: 'Egypt' },
  { code: 'SV', dialCode: '+503', name: 'El Salvador' },
  { code: 'GQ', dialCode: '+240', name: 'Equatorial Guinea' },
  { code: 'ER', dialCode: '+291', name: 'Eritrea' },
  { code: 'EE', dialCode: '+372', name: 'Estonia' },
  { code: 'ET', dialCode: '+251', name: 'Ethiopia' },
  { code: 'FJ', dialCode: '+679', name: 'Fiji' },
  { code: 'FI', dialCode: '+358', name: 'Finland' },
  { code: 'FR', dialCode: '+33', name: 'France' },
  { code: 'GA', dialCode: '+241', name: 'Gabon' },
  { code: 'GM', dialCode: '+220', name: 'Gambia' },
  { code: 'GE', dialCode: '+995', name: 'Georgia' },
  { code: 'DE', dialCode: '+49', name: 'Germany' },
  { code: 'GH', dialCode: '+233', name: 'Ghana' },
  { code: 'GR', dialCode: '+30', name: 'Greece' },
  { code: 'GT', dialCode: '+502', name: 'Guatemala' },
  { code: 'GN', dialCode: '+224', name: 'Guinea' },
  { code: 'GW', dialCode: '+245', name: 'Guinea-Bissau' },
  { code: 'GY', dialCode: '+592', name: 'Guyana' },
  { code: 'HT', dialCode: '+509', name: 'Haiti' },
  { code: 'HN', dialCode: '+504', name: 'Honduras' },
  { code: 'HU', dialCode: '+36', name: 'Hungary' },
  { code: 'IS', dialCode: '+354', name: 'Iceland' },
  { code: 'IN', dialCode: '+91', name: 'India' },
  { code: 'ID', dialCode: '+62', name: 'Indonesia' },
  { code: 'IR', dialCode: '+98', name: 'Iran' },
  { code: 'IQ', dialCode: '+964', name: 'Iraq' },
  { code: 'IE', dialCode: '+353', name: 'Ireland' },
  { code: 'IL', dialCode: '+972', name: 'Israel' },
  { code: 'IT', dialCode: '+39', name: 'Italy' },
  { code: 'JM', dialCode: '+1-876', name: 'Jamaica' },
  { code: 'JP', dialCode: '+81', name: 'Japan' },
  { code: 'JO', dialCode: '+962', name: 'Jordan' },
  { code: 'KZ', dialCode: '+7', name: 'Kazakhstan' },
  { code: 'KE', dialCode: '+254', name: 'Kenya' },
  { code: 'KP', dialCode: '+850', name: 'North Korea' },
  { code: 'KR', dialCode: '+82', name: 'South Korea' },
  { code: 'KW', dialCode: '+965', name: 'Kuwait' },
  { code: 'KG', dialCode: '+996', name: 'Kyrgyzstan' },
  { code: 'LA', dialCode: '+856', name: 'Laos' },
  { code: 'LV', dialCode: '+371', name: 'Latvia' },
  { code: 'LB', dialCode: '+961', name: 'Lebanon' },
  { code: 'LS', dialCode: '+266', name: 'Lesotho' },
  { code: 'LR', dialCode: '+231', name: 'Liberia' },
  { code: 'LY', dialCode: '+218', name: 'Libya' },
  { code: 'LI', dialCode: '+423', name: 'Liechtenstein' },
  { code: 'LT', dialCode: '+370', name: 'Lithuania' },
  { code: 'LU', dialCode: '+352', name: 'Luxembourg' },
  { code: 'MK', dialCode: '+389', name: 'Macedonia' },
  { code: 'MG', dialCode: '+261', name: 'Madagascar' },
  { code: 'MW', dialCode: '+265', name: 'Malawi' },
  { code: 'MY', dialCode: '+60', name: 'Malaysia' },
  { code: 'MV', dialCode: '+960', name: 'Maldives' },
  { code: 'ML', dialCode: '+223', name: 'Mali' },
  { code: 'MT', dialCode: '+356', name: 'Malta' },
  { code: 'MR', dialCode: '+222', name: 'Mauritania' },
  { code: 'MU', dialCode: '+230', name: 'Mauritius' },
  { code: 'MX', dialCode: '+52', name: 'Mexico' },
  { code: 'MD', dialCode: '+373', name: 'Moldova' },
  { code: 'MC', dialCode: '+377', name: 'Monaco' },
  { code: 'MN', dialCode: '+976', name: 'Mongolia' },
  { code: 'ME', dialCode: '+382', name: 'Montenegro' },
  { code: 'MA', dialCode: '+212', name: 'Morocco' },
  { code: 'MZ', dialCode: '+258', name: 'Mozambique' },
  { code: 'MM', dialCode: '+95', name: 'Myanmar' },
  { code: 'NA', dialCode: '+264', name: 'Namibia' },
  { code: 'NP', dialCode: '+977', name: 'Nepal' },
  { code: 'NL', dialCode: '+31', name: 'Netherlands' },
  { code: 'NZ', dialCode: '+64', name: 'New Zealand' },
  { code: 'NI', dialCode: '+505', name: 'Nicaragua' },
  { code: 'NE', dialCode: '+227', name: 'Niger' },
  { code: 'NG', dialCode: '+234', name: 'Nigeria' },
  { code: 'NO', dialCode: '+47', name: 'Norway' },
  { code: 'OM', dialCode: '+968', name: 'Oman' },
  { code: 'PK', dialCode: '+92', name: 'Pakistan' },
  { code: 'PA', dialCode: '+507', name: 'Panama' },
  { code: 'PG', dialCode: '+675', name: 'Papua New Guinea' },
  { code: 'PY', dialCode: '+595', name: 'Paraguay' },
  { code: 'PE', dialCode: '+51', name: 'Peru' },
  { code: 'PH', dialCode: '+63', name: 'Philippines' },
  { code: 'PL', dialCode: '+48', name: 'Poland' },
  { code: 'PT', dialCode: '+351', name: 'Portugal' },
  { code: 'QA', dialCode: '+974', name: 'Qatar' },
  { code: 'RO', dialCode: '+40', name: 'Romania' },
  { code: 'RU', dialCode: '+7', name: 'Russia' },
  { code: 'RW', dialCode: '+250', name: 'Rwanda' },
  { code: 'SA', dialCode: '+966', name: 'Saudi Arabia' },
  { code: 'SN', dialCode: '+221', name: 'Senegal' },
  { code: 'RS', dialCode: '+381', name: 'Serbia' },
  { code: 'SL', dialCode: '+232', name: 'Sierra Leone' },
  { code: 'SG', dialCode: '+65', name: 'Singapore' },
  { code: 'SK', dialCode: '+421', name: 'Slovakia' },
  { code: 'SI', dialCode: '+386', name: 'Slovenia' },
  { code: 'SO', dialCode: '+252', name: 'Somalia' },
  { code: 'ZA', dialCode: '+27', name: 'South Africa' },
  { code: 'SS', dialCode: '+211', name: 'South Sudan' },
  { code: 'ES', dialCode: '+34', name: 'Spain' },
  { code: 'LK', dialCode: '+94', name: 'Sri Lanka' },
  { code: 'SD', dialCode: '+249', name: 'Sudan' },
  { code: 'SR', dialCode: '+597', name: 'Suriname' },
  { code: 'SZ', dialCode: '+268', name: 'Swaziland' },
  { code: 'SE', dialCode: '+46', name: 'Sweden' },
  { code: 'CH', dialCode: '+41', name: 'Switzerland' },
  { code: 'SY', dialCode: '+963', name: 'Syria' },
  { code: 'TW', dialCode: '+886', name: 'Taiwan' },
  { code: 'TJ', dialCode: '+992', name: 'Tajikistan' },
  { code: 'TZ', dialCode: '+255', name: 'Tanzania' },
  { code: 'TH', dialCode: '+66', name: 'Thailand' },
  { code: 'TL', dialCode: '+670', name: 'Timor-Leste' },
  { code: 'TG', dialCode: '+228', name: 'Togo' },
  { code: 'TT', dialCode: '+1-868', name: 'Trinidad and Tobago' },
  { code: 'TN', dialCode: '+216', name: 'Tunisia' },
  { code: 'TR', dialCode: '+90', name: 'Turkey' },
  { code: 'TM', dialCode: '+993', name: 'Turkmenistan' },
  { code: 'UG', dialCode: '+256', name: 'Uganda' },
  { code: 'UA', dialCode: '+380', name: 'Ukraine' },
  { code: 'AE', dialCode: '+971', name: 'United Arab Emirates' },
  { code: 'GB', dialCode: '+44', name: 'United Kingdom' },
  { code: 'US', dialCode: '+1', name: 'United States' },
  { code: 'UY', dialCode: '+598', name: 'Uruguay' },
  { code: 'UZ', dialCode: '+998', name: 'Uzbekistan' },
  { code: 'VE', dialCode: '+58', name: 'Venezuela' },
  { code: 'VN', dialCode: '+84', name: 'Vietnam' },
  { code: 'YE', dialCode: '+967', name: 'Yemen' },
  { code: 'ZM', dialCode: '+260', name: 'Zambia' },
  { code: 'ZW', dialCode: '+263', name: 'Zimbabwe' },
].sort((a, b) => a.name.localeCompare(b.name));

export const Settings: React.FC = () => {
  const { user, updateUser, updateProfile, changePassword, isLoading } = useAuthStore();
  const { 
    downloadHistory, 
    recentlyDeleted, 
    loadHistory, 
    restoreFromDeleted, 
    permanentlyDelete
  } = useTestimonialStore();
  const location = useLocation();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCountry, setPhoneCountry] = useState(ALL_COUNTRIES.find(c => c.code === 'US')!);
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("Other");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [activeTab, setActiveTab] = useState("General");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setBusinessName(user.businessName || "");
      setBusinessType(user.businessType || "Other");
      setWebsiteUrl(user.websiteUrl || "");
      setInstagramUrl(user.instagramUrl || "");
      setFacebookUrl(user.facebookUrl || "");
      setLinkedinUrl(user.linkedinUrl || "");
    }
  }, [user]);

  useEffect(() => {
    setImageError(false);
  }, [profilePreview, user?.avatar]);

  const hasChanges = user ? (
    fullName !== (user.name || "") ||
    phone !== (user.phone || "") ||
    businessName !== (user.businessName || "") ||
    businessType !== (user.businessType || "Other") ||
    websiteUrl !== (user.websiteUrl || "") ||
    instagramUrl !== (user.instagramUrl || "") ||
    facebookUrl !== (user.facebookUrl || "") ||
    linkedinUrl !== (user.linkedinUrl || "") ||
    profilePreview !== null ||
    isRemovingAvatar
  ) : false;

  useEffect(() => {
    if (location.state?.missingInfo) {
      toast.warning("Please complete your business profile to start creating testimonials! 🚀", {
        description: "We need these details to personalize your testimonial cards.",
        duration: 5000,
      });
      setActiveTab("Business");
    } else if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) {
        toast.error("File size too large. Max 800KB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
        setIsRemovingAvatar(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const avatarUpdate = isRemovingAvatar ? null : (profilePreview || user?.avatar);
      
      await updateProfile({ 
        name: fullName, 
        avatar: avatarUpdate,
        businessName,
        businessType,
        websiteUrl,
        instagramUrl,
        facebookUrl,
        linkedinUrl,
        phone
      });
      setIsRemovingAvatar(false);
      setProfilePreview(null);
      toast.success("Settings saved successfully!");
    } catch (error: any) {
      toast.error(error);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error);
    }
  };

  const handleRemoveProfile = () => {
    setProfilePreview(null);
    setIsRemovingAvatar(true);
    toast.info("Photo removal pending. Click 'Save Changes' to confirm.");
  };

  const handleDiscard = () => {
    if (user) {
      setFullName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setBusinessName(user.businessName || "");
      setBusinessType(user.businessType || "Other");
      setWebsiteUrl(user.websiteUrl || "");
      setInstagramUrl(user.instagramUrl || "");
      setFacebookUrl(user.facebookUrl || "");
      setLinkedinUrl(user.linkedinUrl || "");
    }
    setProfilePreview(null);
    setIsRemovingAvatar(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.info("Changes discarded.");
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto px-4 md:px-8 space-y-10 animate-in fade-in duration-500 pb-20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
        {/* Left Column: Heading + Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-10">
          <div className="shrink-0">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Settings</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Account & Preferences</p>
          </div>

          <div className="space-y-2">
            {[
              { icon: User, label: "General" },
              { icon: Building2, label: "Business" },
              { icon: Shield, label: "Security" },
              { icon: Download, label: "Download History" },
              { icon: Trash2, label: "Recently Deleted" },
            ].map((nav) => (
              <button 
                key={nav.label}
                onClick={() => setActiveTab(nav.label)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-lg transition-all font-bold text-sm ${
                  activeTab === nav.label
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-black/5 dark:shadow-white/5 scale-[1.02]" 
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <nav.icon className="w-4 h-4" />
                {nav.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Main Settings Form */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === "General" && (
              <motion.div
                key="general"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Profile Section */}
                <div className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/10 rounded-xl p-8 shadow-sm">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden flex items-center justify-center text-slate-400 transition-all group-hover:border-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/10">
                        {!isRemovingAvatar && (profilePreview || user?.avatar) && !imageError ? (
                          <img src={profilePreview || user?.avatar || ''} alt="Profile" className="w-full h-full object-cover" onError={() => setImageError(true)} />
                        ) : (
                          <span className="text-4xl font-black text-slate-400">{user?.email ? user.email.charAt(0).toUpperCase() : 'G'}</span>
                        )}
                      </div>
                      <label className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 rounded-lg cursor-pointer shadow-xl border border-black/5 dark:border-white/10 hover:scale-110 transition-transform">
                        <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 dark:text-white">Profile Photo</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Update your profile picture here.</p>
                      <div className="flex gap-2 mt-2">
                         <button 
                            onClick={handleRemoveProfile}
                            className="text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                         >
                            Remove
                         </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-black/5 dark:border-white/5 rounded-md py-2 px-11 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                            placeholder="Enter your name"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="email"
                            value={email}
                            disabled
                            className="w-full bg-slate-100 dark:bg-slate-800/80 border border-black/5 dark:border-white/5 rounded-md py-2 px-11 text-slate-400 cursor-not-allowed font-medium"
                          />
                        </div>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                        <div className="flex gap-2 items-stretch">
                          {/* Country Selector */}
                          <div className="relative shrink-0">
                            <select
                              value={phoneCountry.code}
                              onChange={(e) => {
                                const c = ALL_COUNTRIES.find(x => x.code === e.target.value);
                                if (c) setPhoneCountry(c);
                              }}
                              className="h-full appearance-none bg-slate-50 dark:bg-slate-800/50 border border-black/5 dark:border-white/5 rounded-md py-2 pl-3 pr-8 text-[13px] font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                            >
                              {ALL_COUNTRIES.map(c => (
                                <option key={c.code} value={c.code}>
                                  {c.code} ({c.dialCode})
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none">
                              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          {/* Phone Input */}
                          <div className="relative flex-1">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-black/5 dark:border-white/5 rounded-md py-2 px-11 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                              placeholder="e.g. 234 567 8900"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Social Profiles Section */}
                  <div className="mt-8 border-t border-black/5 dark:border-white/5 pt-8">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-6">Social Profiles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Instagram URL</label>
                        <input
                          type="url"
                          value={instagramUrl}
                          onChange={(e) => setInstagramUrl(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-black/5 dark:border-white/5 rounded-md py-2 px-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500/50 transition-all font-medium"
                          placeholder="https://instagram.com/yourprofile"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Facebook Page URL</label>
                        <input
                          type="url"
                          value={facebookUrl}
                          onChange={(e) => setFacebookUrl(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-black/5 dark:border-white/5 rounded-md py-2 px-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                          placeholder="https://facebook.com/yourpage"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">LinkedIn URL</label>
                        <input
                          type="url"
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-black/5 dark:border-white/5 rounded-md py-2 px-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600/50 transition-all font-medium"
                          placeholder="https://linkedin.com/company/yourcompany"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "Business" && (
              <motion.div
                key="business"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Business Section */}
                <div className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/10 rounded-xl p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">Business Information</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Displayed on your public testimonials.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Name</label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-black/5 dark:border-white/5 rounded-md py-2 px-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                        placeholder="e.g. Acme Corp"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Type</label>
                      <select
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-black/5 dark:border-white/5 rounded-md py-2 px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all appearance-none bg-no-repeat bg-[right_1.5rem_center] font-medium"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '1rem' }}
                      >
                        <option value="SaaS">Software / SaaS</option>
                        <option value="E-commerce">E-commerce</option>
                        <option value="Agency">Agency / Service</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Website URL (Optional)</label>
                      <input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-black/5 dark:border-white/5 rounded-md py-2 px-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "Security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/10 rounded-xl p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">Security Settings</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Protect your account and data.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Change Password</h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                          <div className="relative group">
                            <input
                              type={showCurrent ? "text" : "password"}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-black/5 dark:border-white/5 rounded-md py-2 px-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium pr-12"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrent(!showCurrent)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-blue-500 transition-colors"
                            >
                              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                            <div className="relative group">
                              <input
                                type={showNew ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-black/5 dark:border-white/5 rounded-md py-2 px-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium pr-12"
                                placeholder="••••••••"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-blue-500 transition-colors"
                              >
                                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                            <div className="relative group">
                              <input
                                type={showConfirm ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-black/5 dark:border-white/5 rounded-md py-2 px-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium pr-12"
                                placeholder="••••••••"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-blue-500 transition-colors"
                              >
                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end mt-4 gap-4">
                        <button 
                          onClick={handleDiscard}
                          className="px-6 py-2 rounded-lg text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-xs"
                        >
                          Discard
                        </button>
                        <button 
                          onClick={handlePasswordUpdate}
                          disabled={isLoading}
                          className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white dark:text-slate-900 px-8 py-3 rounded-lg text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-black/5 dark:shadow-white/5"
                        >
                          {isLoading ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "Download History" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-[calc(100vh-12rem)] min-h-[500px]"
              >
                <div className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/10 rounded-xl p-8 shadow-sm h-full flex flex-col">
                  <div className="flex items-center justify-between mb-8 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Download className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Download History</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Recent Exports</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                        {downloadHistory.filter(ev => !ev.isDeleted).length}
                      </span>
                    </div>
                  </div>

                  {Array.isArray(downloadHistory) && downloadHistory.filter(ev => ev && !ev.isDeleted).length > 0 ? (
                    <div className="flex-1 overflow-y-auto scrollbar-thin rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/20 dark:bg-slate-800/20">
                      <table className="w-full">
                        <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900 shadow-sm">
                          <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
                            <th className="px-8 py-5 whitespace-nowrap">Asset Name</th>
                            <th className="px-8 py-5 whitespace-nowrap">Format</th>
                            <th className="px-8 py-5 whitespace-nowrap text-right">Date & Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {downloadHistory.filter(ev => ev && !ev.isDeleted).map((event, i) => {
                            const isPending = event.format === 'SAVED' || event.format === 'PENDING';
                            const formatLabel = isPending ? 'PENDING' : event.format;
                            
                            return (
                              <tr 
                                key={i} 
                                className={`group transition-all duration-200 border-l-4 ${
                                  isPending 
                                    ? "bg-red-50/20 dark:bg-red-500/5 border-red-500 hover:bg-red-50/40 dark:hover:bg-red-500/10" 
                                    : "hover:bg-white dark:hover:bg-slate-800/40 border-transparent"
                                }`}
                              >
                                <td className="px-8 py-6 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${
                                      isPending ? "bg-red-100 text-red-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                    }`}>
                                      {event.name?.[0] || 'A'}
                                    </div>
                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{event.name}</span>
                                  </div>
                                </td>
                                <td className="px-8 py-6 whitespace-nowrap">
                                  <span className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black tracking-wide uppercase flex items-center gap-1.5 w-fit ${
                                    isPending ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' :
                                    event.format?.includes('PNG') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                    event.format?.includes('PDF') ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' :
                                    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                                  }`}>
                                    {isPending && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                                    {formatLabel}
                                  </span>
                                </td>
                                <td className="px-8 py-6 whitespace-nowrap text-right">
                                  <div className="flex items-center justify-end gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{event.date}</span>
                                    <span className="text-slate-300 dark:text-slate-700">•</span>
                                    <span>{event.time}</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/5">
                      <Download className="w-6 h-6 text-slate-300 mb-2" />
                      <p className="text-sm font-bold text-slate-500">No exports yet</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "Recently Deleted" && (
              <motion.div
                key="deleted"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-[calc(100vh-12rem)] min-h-[500px]"
              >
                <div className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/10 rounded-xl p-8 shadow-sm h-full flex flex-col">
                  <div className="flex items-center justify-between mb-8 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Recently Deleted</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Trash (Auto-clears in 7 days)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                      <span className="text-xs font-black text-rose-600 dark:text-rose-400">{recentlyDeleted.length}</span>
                    </div>
                  </div>

                  {Array.isArray(recentlyDeleted) && recentlyDeleted.filter(item => item).length > 0 ? (
                    <div className="flex-1 overflow-y-auto scrollbar-thin rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/20 dark:bg-slate-800/20">
                      <table className="w-full">
                        <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900 shadow-sm">
                          <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
                            <th className="px-8 py-5">Testimonial</th>
                            <th className="px-8 py-5">Remaining Time</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {recentlyDeleted.map((item) => {
                            const deletedAt = item?.deletedAt;
                            const deletedTime = deletedAt ? new Date(deletedAt).getTime() : Date.now();
                            const now = new Date().getTime();
                            const diff = (7 * 24 * 60 * 60 * 1000) - (now - deletedTime);
                            const daysLeft = isNaN(diff) ? 7 : Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
                            
                            return (
                              <tr key={item.id} className="hover:bg-white dark:hover:bg-slate-800/40 transition-all duration-200">
                                <td className="px-8 py-6">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400">
                                      {item.name?.[0] || 'A'}
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.name}</p>
                                      <p className="text-[10px] font-medium text-slate-500">{item.role}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-8 py-6">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    daysLeft <= 1 ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                                  }`}>
                                    {daysLeft} days left
                                  </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button 
                                      onClick={() => {
                                        restoreFromDeleted(item.id!);
                                        toast.success("Testimonial restored! 🔄");
                                      }}
                                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                      title="Restore"
                                    >
                                      <Zap className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => {
                                        const confirmed = window.confirm(
                                          "Are you sure you want to permanently delete this testimonial?\n\nThis action cannot be undone."
                                        );
                                        if (!confirmed) return;
                                        permanentlyDelete(item.id!);
                                        toast.success("Permanently deleted.");
                                      }}
                                      className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                                      title="Delete Permanently"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/5">
                      <Trash2 className="w-6 h-6 text-slate-300 mb-2" />
                      <p className="text-sm font-bold text-slate-500">Trash is empty</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons - Hidden for specific tabs */}
          {activeTab !== "Download History" && activeTab !== "Security" && activeTab !== "Recently Deleted" && (
            <motion.div layout className="flex items-center justify-end gap-4 pt-4 shrink-0">
               {hasChanges && (
                 <motion.span 
                   initial={{ opacity: 0, x: 10 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mr-2 flex items-center gap-1.5"
                 >
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                   Unsaved Changes
                 </motion.span>
               )}
               <button 
                  onClick={handleDiscard}
                  className="px-8 py-3.5 rounded-lg text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
               >
                  Discard
               </button>
               <button
                onClick={handleSave}
                disabled={!hasChanges || isLoading}
                className={`px-10 py-3.5 rounded-lg font-bold flex items-center gap-2 shadow-xl transition-all active:scale-95 ${
                  hasChanges 
                    ? "bg-[#101828] hover:bg-black text-white shadow-black/10" 
                    : "bg-slate-200 dark:bg-slate-800 text-slate-400 shadow-none opacity-50 cursor-not-allowed"
                }`}
              >
                <Save className="w-5 h-5" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
