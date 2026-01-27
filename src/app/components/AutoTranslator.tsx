import React, { useState } from 'react';
import { Globe, Loader2 } from 'lucide-react';
import { translateText } from '../services/translateService';
import { toast } from 'sonner';

interface AutoTranslatorProps {
    sourceText: string;
    onTranslate: (translatedText: string) => void;
    className?: string;
    label?: string;
}

export const AutoTranslator: React.FC<AutoTranslatorProps> = ({
    sourceText,
    onTranslate,
    className = "",
    label = "Translate to Bangla"
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleTranslate = async () => {
        if (!sourceText) {
            toast.error('Please enter English text first');
            return;
        }

        try {
            setIsLoading(true);
            const translated = await translateText(sourceText, 'bn');
            onTranslate(translated);
            toast.success('Translated successfully');
        } catch (error) {
            console.error(error);
            toast.error('Translation failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleTranslate}
            disabled={isLoading || !sourceText}
            className={`text-[#D91976] hover:text-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 text-xs font-bold ${className}`}
            title={label}
        >
            {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
            ) : (
                <Globe size={14} />
            )}
            <span>{isLoading ? 'Translating...' : 'Auto Translate'}</span>
        </button>
    );
};
