import React, { useState, useEffect } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { X, Key, FileText, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { geminiApiKey, patientData, setGeminiApiKey, setPatientData } = useChatStore();

    const [tempKey, setTempKey] = useState('');
    const [tempData, setTempData] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTempKey(geminiApiKey || '');
            setTempData(patientData || '');
        }
    }, [isOpen, geminiApiKey, patientData]);

    const handleSave = () => {
        setGeminiApiKey(tempKey);
        setPatientData(tempData);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-lg bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100/50">
                            <h2 className="text-xl font-bold tracking-tight text-slate-800">
                                Application Settings
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] scrollbar-hide">

                            {/* Gemini API Key */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Key size={16} className="text-primary" />
                                    Gemini API Key
                                </label>
                                <p className="text-xs text-slate-500 mb-2">
                                    Required to generate responses using Google's Gemini AI.
                                </p>
                                <input
                                    type="password"
                                    value={tempKey}
                                    onChange={(e) => setTempKey(e.target.value)}
                                    placeholder="AIzaSy..."
                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                />
                            </div>

                            {/* Patient Context Data */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <FileText size={16} className="text-primary" />
                                    Patient Data (Context)
                                </label>
                                <p className="text-xs text-slate-500 mb-2">
                                    Provide patient history, symptoms, or demographics to ground the AI's responses.
                                </p>
                                <textarea
                                    value={tempData}
                                    onChange={(e) => setTempData(e.target.value)}
                                    placeholder="E.g., 45-year-old male, history of hypertension, current symptoms include mild anxiety..."
                                    rows={5}
                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                                />
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-slate-100/50 bg-slate-50/30 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-xl shadow-sm hover:shadow shadow-primary/20 transition-all active:scale-95"
                            >
                                <Save size={16} />
                                Save Settings
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
