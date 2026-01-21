'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, ChevronRight, Trophy, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api, getSupabaseHeaders } from '@/lib/api';

interface Question {
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
}

interface Quiz {
    lesson_title: string;
    questions: Question[];
}
interface QuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    lessonTitle: string;
    topic: string;
    level: string;
    onPass: () => void;
}

export default function QuizModal({ isOpen, onClose, lessonTitle, topic, level, onPass }: QuizModalProps) {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState<'intro' | 'questions' | 'results'>('intro');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (isOpen) {
            fetchQuiz();
        } else {
            // Reset state when closing
            setQuiz(null);
            setCurrentStep('intro');
            setCurrentQuestionIndex(0);
            setSelectedAnswer(null);
            setIsAnswerSubmitted(false);
            setScore(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const fetchQuiz = async () => {
        setLoading(true);
        try {
            const response = await fetch(api.generateQuiz, {
                method: 'POST',
                headers: getSupabaseHeaders(),
                body: JSON.stringify({
                    lesson_title: lessonTitle,
                    topic,
                    level,
                    num_questions: 6
                }),
            });
            const data = await response.json();
            setQuiz(data);
        } catch (error) {
            console.error('Error fetching quiz:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (option: string) => {
        if (isAnswerSubmitted) return;
        setSelectedAnswer(option);
    };

    const handleSubmitAnswer = () => {
        if (!selectedAnswer || !quiz) return;

        const isCorrect = selectedAnswer === quiz.questions[currentQuestionIndex].correct_answer;
        if (isCorrect) setScore(score + 1);

        setIsAnswerSubmitted(true);
    };

    const handleNextQuestion = () => {
        if (!quiz) return;

        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setIsAnswerSubmitted(false);
        } else {
            setCurrentStep('results');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-2xl max-h-[90vh] glass-dark border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400"
                >
                    <X size={20} />
                </button>

                <div className="p-8 md:p-12 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-6">
                            <div className="w-12 h-12 border-4 border-[#2AB7CA] border-t-transparent rounded-full animate-spin" />
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-bold">Constructing Quiz...</h3>
                                <p className="text-slate-400">Gemini is analyzing the lesson content.</p>
                            </div>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {currentStep === 'intro' && (
                                <motion.div
                                    key="intro"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-4">
                                        <div className="w-16 h-16 bg-[#2AB7CA]/20 rounded-2xl flex items-center justify-center text-[#2AB7CA]">
                                            <Trophy size={32} />
                                        </div>
                                        <h2 className="text-3xl font-black tracking-tight">{lessonTitle}</h2>
                                        <p className="text-slate-400 text-lg leading-relaxed">
                                            Ready to test your knowledge? This quiz will cover the core concepts we just explored.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setCurrentStep('questions')}
                                        className="w-full bg-white text-black font-bold py-5 rounded-2xl hover:bg-[#2AB7CA] hover:text-white transition-all shadow-xl shadow-[#2AB7CA]/10 flex items-center justify-center gap-2"
                                    >
                                        Start Knowledge Check
                                        <ChevronRight size={20} />
                                    </button>
                                </motion.div>
                            )}

                            {currentStep === 'questions' && quiz && (
                                <motion.div
                                    key="questions"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest shadow-sm">
                                            <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                                            <span>{Math.round(((currentQuestionIndex) / quiz.questions.length) * 100)}% Complete</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#2AB7CA] transition-all duration-500"
                                                style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold leading-tight">
                                        {quiz.questions[currentQuestionIndex].question}
                                    </h3>

                                    <div className="grid grid-cols-1 gap-3">
                                        {quiz.questions[currentQuestionIndex].options.map((option, idx) => {
                                            const isSelected = selectedAnswer === option;
                                            const isCorrect = option === quiz.questions[currentQuestionIndex].correct_answer;

                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleAnswerSelect(option)}
                                                    className={cn(
                                                        "w-full text-left p-5 rounded-2xl border transition-all relative flex items-center justify-between group",
                                                        !isAnswerSubmitted && isSelected && "bg-[#2AB7CA]/20 border-[#2AB7CA]/50 text-indigo-100",
                                                        !isAnswerSubmitted && !isSelected && "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10",
                                                        isAnswerSubmitted && isCorrect && "bg-[#FED766]/20 border-[#FED766]/50 text-emerald-100",
                                                        isAnswerSubmitted && isSelected && !isCorrect && "bg-rose-500/20 border-rose-500/50 text-rose-100",
                                                        isAnswerSubmitted && !isCorrect && !isSelected && "opacity-40 bg-white/5 border-white/5"
                                                    )}
                                                >
                                                    <span className="font-medium">{option}</span>
                                                    {isAnswerSubmitted && isCorrect && <CheckCircle2 size={20} className="text-[#FED766]" />}
                                                    {isAnswerSubmitted && isSelected && !isCorrect && <AlertCircle size={20} className="text-rose-400" />}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {isAnswerSubmitted && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-2"
                                        >
                                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Explanation</p>
                                            <p className="text-slate-300 leading-relaxed">
                                                {quiz.questions[currentQuestionIndex].explanation}
                                            </p>
                                        </motion.div>
                                    )}

                                    <div className="pt-4">
                                        {!isAnswerSubmitted ? (
                                            <button
                                                disabled={!selectedAnswer}
                                                onClick={handleSubmitAnswer}
                                                className="w-full bg-[#2AB7CA] text-white font-bold py-4 rounded-xl hover:bg-indigo-600 disabled:opacity-50 transition-all"
                                            >
                                                Check Answer
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleNextQuestion}
                                                className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                                            >
                                                {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'See Results'}
                                                <ChevronRight size={20} />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {currentStep === 'results' && (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center space-y-8 py-4"
                                >
                                    <div className="relative inline-block">
                                        <div className="w-32 h-32 bg-[#2AB7CA]/20 rounded-full flex items-center justify-center text-[#2AB7CA] mx-auto">
                                            <Trophy size={48} />
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-[#FED766] text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl border-4 border-black">
                                            {score}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h2 className="text-4xl font-black">{score >= 4 ? 'Mastered!' : 'Keep Practicing'}</h2>
                                        <p className="text-slate-400 text-lg">
                                            You scored <span className="text-white font-bold">{score} out of {quiz?.questions.length}</span>!
                                            {score >= 4 ? " You've unlocked the next lesson." : " You need at least 4/6 to pass."}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => {
                                                setCurrentStep('questions');
                                                setCurrentQuestionIndex(0);
                                                setIsAnswerSubmitted(false);
                                                setSelectedAnswer(null);
                                                setScore(0);
                                            }}
                                            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 rounded-2xl transition-all"
                                        >
                                            <RotateCcw size={18} />
                                            Retry
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (score >= 4) onPass();
                                                onClose();
                                            }}
                                            className={cn(
                                                "font-bold py-4 rounded-2xl transition-all shadow-lg shadow-[#2AB7CA]/20",
                                                score >= 4 ? "bg-[#FED766] hover:bg-emerald-600 text-white" : "bg-white/10 text-slate-500 cursor-not-allowed"
                                            )}
                                        >
                                            {score >= 4 ? 'Continue' : 'Locked'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
