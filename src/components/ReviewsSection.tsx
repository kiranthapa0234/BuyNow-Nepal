import React from 'react';
import { Star, MessageSquarePlus, UserCheck, ShieldCheck, ThumbsUp } from 'lucide-react';
import { CUSTOMER_REVIEWS } from '../data/products';
import { CustomerReview } from '../types';

export default function ReviewsSection() {
  const [reviewsList, setReviewsList] = React.useState<CustomerReview[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);

  // Review state inputs
  const [authorName, setAuthorName] = React.useState('');
  const [locationCity, setLocationCity] = React.useState('');
  const [rating, setRating] = React.useState(5);
  const [commentText, setCommentText] = React.useState('');
  const [likes, setLikes] = React.useState<Record<string, number>>({});

  // Fetch reviews on mount
  React.useEffect(() => {
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setReviewsList(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch reviews:', err);
        setLoading(false);
      });
  }, []);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName || !commentText || !locationCity) {
      alert('Please fill out all mandatory review fields!');
      return;
    }

    fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        author: authorName,
        location: locationCity,
        rating: rating,
        comment: commentText
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.review) {
          setReviewsList((prev) => [data.review, ...prev]);
          setAuthorName('');
          setLocationCity('');
          setCommentText('');
          setRating(5);
          setShowForm(false);
        } else {
          alert(data.error || 'Failed to submit review.');
        }
      })
      .catch((err) => {
        console.error('Failed to submit review comment:', err);
        alert('Network connection error while submitting review.');
      });
  };

  const handleLike = (id: string) => {
    fetch(`/api/reviews/${id}/like`, {
      method: 'POST'
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLikes((prev) => ({
            ...prev,
            [id]: data.likes
          }));
        }
      })
      .catch((err) => {
        console.error('Failed to record review like:', err);
      });
  };

  // Aggregated rating statistics
  const averageRating = (
    reviewsList.reduce((sum, rev) => sum + rev.rating, 0) / reviewsList.length
  ).toFixed(1);

  const starBreakdowns = [
    { star: 5, count: reviewsList.filter((r) => r.rating === 5).length },
    { star: 4, count: reviewsList.filter((r) => r.rating === 4).length },
    { star: 3, count: reviewsList.filter((r) => r.rating === 3).length },
    { star: 2, count: reviewsList.filter((r) => r.rating === 2).length },
    { star: 1, count: reviewsList.filter((r) => r.rating === 1).length },
  ];

  return (
    <section className="py-12 bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left" id="reviews-section-panel">
      <div className="border-b border-gray-200 pb-5 mb-8">
        <h2 className="text-2xl font-black text-gray-950 tracking-tight">
          Customer Testimonials
        </h2>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1 block">
          Genuine Purchase Feedback and Ratings from Nepal
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Side: Rating Aggregate and statistics panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center space-y-4">
            <div>
              <span className="text-5xl font-black text-blue-600 block leading-none">
                {averageRating}
              </span>
              <span className="text-xs text-gray-450 font-bold uppercase block mt-2">
                Out of 5 Stars
              </span>
            </div>

            {/* General large stars */}
            <div className="flex justify-center text-yellow-400">
              {Array.from({ length: 5 }).map((_, id) => (
                <Star
                  key={id}
                  size={20}
                  className={id < Math.floor(parseFloat(averageRating)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
                />
              ))}
            </div>

            <p className="text-xs text-gray-500 font-medium">
              Based on {reviewsList.length} reviews from verified BuyNow Nepal customers.
            </p>

            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer shadow-xs select-none"
              id="write-review-toggle-btn"
            >
              <MessageSquarePlus size={15} />
              <span>{showForm ? 'Close form' : 'Write a Review'}</span>
            </button>
          </div>

          {/* Progress Rating breakdown */}
          <div className="bg-white border border-gray-150 rounded-2xl p-6 space-y-3 shadow-xs">
            {starBreakdowns.map((b) => {
              const percentage = Math.round((b.count / reviewsList.length) * 100) || 0;
              return (
                <div key={b.star} className="flex items-center gap-3 text-xs font-semibold">
                  <span className="w-8 shrink-0 text-left text-gray-600">{b.star} star</span>
                  <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-yellow-400 h-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-gray-400 font-bold">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Testimony Feed & Add Review Form */}
        <div className="lg:col-span-8 space-y-6">
          {/* Form write review popup */}
          {showForm && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-left animate-in fade-in duration-200">
              <h3 className="text-sm font-black text-gray-900 mb-4 block">Write about your BuyNow Nepal Experience</h3>
              
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">Your Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. Rabina Koirala"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-hidden focus:border-blue-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">City Destination <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. Dharan"
                      value={locationCity}
                      onChange={(e) => setLocationCity(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-hidden focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">Rating score</label>
                  <div className="flex items-center gap-1.5 text-yellow-400">
                    {[1, 2, 3, 4, 5].map((starsCount) => (
                      <button
                        key={starsCount}
                        type="button"
                        onClick={() => setRating(starsCount)}
                        className="p-1 cursor-pointer transition transform active:scale-110"
                        title={`${starsCount} stars`}
                      >
                        <Star
                          size={18}
                          className={starsCount <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">Your Review comments <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe product quality, delivery, payment channels support, customer support etc."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-150 hover:bg-gray-200 text-gray-700 font-bold py-2 px-5 rounded-lg text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg text-xs transition cursor-pointer"
                    id="submit-review-btn"
                  >
                    Submit Review Comment
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reviews list render */}
          <div className="space-y-4">
            {reviewsList.map((rev) => (
              <div
                key={rev.id}
                className="bg-white border border-gray-150 rounded-xl p-5 text-left shadow-xs hover:border-gray-250 transition-all space-y-3"
                id={`customer-testimonial-${rev.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-blue-100 rounded-full flex items-center justify-center font-bold text-xs text-blue-700">
                      {rev.author.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-gray-900 block">{rev.author}</span>
                      <span className="text-[10px] text-gray-400 font-bold block mt-0.5 uppercase tracking-wider">
                        Verified buyer • From {rev.location}, Nepal
                      </span>
                    </div>
                  </div>
                  
                  <span className="text-[11px] font-mono text-gray-400 font-semibold">{rev.date}</span>
                </div>

                <div className="flex items-center gap-1.5 text-yellow-400">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      size={13}
                      className={idx < rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
                    />
                  ))}
                </div>

                <p className="text-xs text-gray-600 font-medium italic leading-relaxed">
                  "{rev.comment}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  <div className="flex items-center gap-1 text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded">
                    <UserCheck size={11} />
                    <span className="text-[10px] uppercase font-bold tracking-wide">Purchase Verified</span>
                  </div>

                  <button
                    onClick={() => handleLike(rev.id)}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-blue-600 font-semibold transition cursor-pointer select-none"
                    id={`like-review-${rev.id}`}
                  >
                    <ThumbsUp size={12} />
                    <span>Helpful {likes[rev.id] !== undefined ? `(${likes[rev.id]})` : (rev.likes ? `(${rev.likes})` : '')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
