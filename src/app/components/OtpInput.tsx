import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface OtpInputProps {
    length?: number;
    onComplete: (otp: string) => void;
}

export const OtpInput: React.FC<OtpInputProps> = ({ length = 6, onComplete }) => {
    const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        // Allow only first character (if user types fast or somehow triggers multiple chars)
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        const combinedOtp = newOtp.join('');
        if (combinedOtp.length === length) {
            onComplete(combinedOtp);
        }

        // Move to next input if value is entered
        if (value && index < length - 1 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
            // Move to previous input on backspace if current is empty
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').slice(0, length).split('');
        if (data.every(char => !isNaN(Number(char)))) {
            const newOtp = [...otp];
            data.forEach((char, index) => {
                if (index < length) newOtp[index] = char;
            });
            setOtp(newOtp);

            const combinedOtp = newOtp.join('');
            if (combinedOtp.length === length) {
                onComplete(combinedOtp);
            }

            // Focus the last filled input or the next empty one
            const focusIndex = Math.min(data.length, length - 1);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    return (
        <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
                <motion.input
                    key={index}
                    ref={(ref) => { inputRefs.current[index] = ref; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`w-12 h-14 border-2 rounded-xl text-center text-2xl font-bold transition-all outline-none 
            ${digit
                            ? 'border-[#D91976] bg-pink-50 text-[#D91976]'
                            : 'border-gray-200 bg-white text-gray-800 focus:border-[#D91976] focus:ring-2 focus:ring-pink-100'
                        }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                />
            ))}
        </div>
    );
};
