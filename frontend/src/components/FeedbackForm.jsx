import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Loader2, CheckCircle } from 'lucide-react';
import { apiService } from '../services/apiService';
import { motion } from 'framer-motion';

export default function FeedbackForm() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    try {
      await apiService.submitFeedback({
        orderId,
        rating,
        comments
      });
      setIsSubmitted(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-xl border border-gray-100"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-500 w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-500 mb-6">Your feedback helps us improve and serve you better.</p>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Redirecting to home...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-gray-100"
      >
        <div className="text-center mb-8">
          <div className="inline-block bg-cyan-100 text-cyan-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            Order #{orderId.slice(-6).toUpperCase()}
          </div>
          <h1 className="text-3xl font-black text-gray-900">How was your meal?</h1>
          <p className="text-gray-500 mt-2">Rate your experience with Neon Bite</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star 
                  size={48} 
                  className={`transition-colors ${
                    (hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-transparent'
                  }`} 
                />
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Additional Comments (Optional)
            </label>
            <textarea
              rows="4"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Tell us what you loved or what could be better..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none text-gray-800"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${
              rating === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-cyan-500 text-white hover:bg-cyan-600 shadow-lg shadow-cyan-500/30'
            }`}
          >
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Submit Feedback'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
