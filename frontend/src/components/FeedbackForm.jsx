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
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-xl p-10 max-w-md w-full text-center border border-line"
        >
          <CheckCircle className="text-black w-12 h-12 mx-auto mb-5" />
          <h2 className="font-display text-3xl font-semibold text-black mb-2">Thank You!</h2>
          <p className="text-black mb-6">Your feedback helps us improve and serve you better.</p>
          <p className="text-sm text-black">Taking you back to the home page…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-xl p-8 max-w-md w-full border border-line"
      >
        <div className="text-center mb-8">
          <div className="inline-block border border-line text-black px-3 py-1 rounded-full text-xs mb-4">
            Order #{orderId.slice(-6).toUpperCase()}
          </div>
          <h1 className="font-display text-3xl font-semibold text-black">How was your meal?</h1>
          <p className="text-black mt-2">Rate your experience with Neon Bite</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-6 border border-red-200">
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
                    (hoverRating || rating) >= star ? 'fill-black text-black' : 'text-neutral-300 fill-transparent'
                  }`} 
                />
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm text-black mb-2">
              Comments (optional)
            </label>
            <textarea
              rows="4"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Tell us what you loved or what could be better..."
              className="w-full bg-white border border-line rounded-md p-4 outline-none focus:border-black transition-colors resize-none text-black"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className={`w-full py-3.5 rounded-md font-medium transition-colors ${
              rating === 0 
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-neutral-800'
            }`}
          >
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Submit feedback'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
