'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: {
    title: string;
    description: string;
    questions: Question[];
  };
}

export function QuizModal({ isOpen, onClose, quiz }: QuizModalProps) {
  const { showToast } = useAppStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (optionIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [quiz.questions[currentQuestion].id]: optionIndex,
    });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return (correct / quiz.questions.length) * 100;
  };

  const handleFinish = () => {
    const score = calculateScore();
    showToast(`Quiz completed! Score: ${score.toFixed(0)}%`, 'success');
    onClose();
  };

  if (!isOpen) return null;

  const question = quiz.questions[currentQuestion];
  const score = calculateScore();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl"
        >
          <Card className="p-6 md:p-8">
            {!showResults ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{quiz.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Question {currentQuestion + 1} of {quiz.questions.length}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Progress */}
                <div className="w-full bg-border rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                    className="h-full bg-primary rounded-full transition-all"
                  />
                </div>

                {/* Question */}
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-foreground">{question.question}</h3>

                  {/* Options */}
                  <div className="space-y-3">
                    {question.options.map((option, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                          selectedAnswers[question.id] === idx
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedAnswers[question.id] === idx
                                ? 'border-primary bg-primary'
                                : 'border-border'
                            }`}
                          >
                            {selectedAnswers[question.id] === idx && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <span className="text-foreground">{option}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Navigation */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                  >
                    Previous
                  </Button>
                  <div className="flex-1" />
                  <Button onClick={handleNext}>
                    {currentQuestion === quiz.questions.length - 1 ? 'Finish' : 'Next'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                </motion.div>

                <div>
                  <h2 className="text-3xl font-bold text-foreground">Quiz Complete!</h2>
                  <p className="text-5xl font-bold text-primary mt-2">{score.toFixed(0)}%</p>
                  <p className="text-muted-foreground mt-2">
                    {score >= 80
                      ? 'Excellent work!'
                      : score >= 60
                      ? 'Good job!'
                      : 'Keep practicing!'}
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-foreground">
                    You answered {Object.keys(selectedAnswers).length} of{' '}
                    {quiz.questions.length} questions correctly.
                  </p>
                </div>

                <Button onClick={handleFinish} className="w-full">
                  Finish
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
