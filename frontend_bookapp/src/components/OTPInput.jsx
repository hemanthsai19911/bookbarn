import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function OTPInput({ length = 6, onComplete, disabled = false }) {
    const [otp, setOtp] = useState(new Array(length).fill(''));
    const inputRefs = useRef([]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < length - 1) {
            inputRefs.current[index + 1].focus();
        }

        // Call onComplete when all digits are filled
        const otpString = newOtp.join('');
        if (otpString.length === length) {
            onComplete(otpString);
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1].focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1].focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, length);
        const newOtp = [...otp];

        for (let i = 0; i < pastedData.length; i++) {
            if (!isNaN(pastedData[i])) {
                newOtp[i] = pastedData[i];
            }
        }

        setOtp(newOtp);

        // Focus last filled input or next empty
        const lastFilledIndex = Math.min(pastedData.length, length - 1);
        inputRefs.current[lastFilledIndex]?.focus();

        // Call onComplete if all filled
        const otpString = newOtp.join('');
        if (otpString.length === length) {
            onComplete(otpString);
        }
    };

    return (
        <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
                <motion.input
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    whileFocus={{ scale: 1.05 }}
                />
            ))}
        </div>
    );
}

