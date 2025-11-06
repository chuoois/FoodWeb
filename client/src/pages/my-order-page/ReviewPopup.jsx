import React, { useState } from "react";
import { Star, X, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createFeedback } from "@/services/feedback.service";

export function ReviewPopup({ isOpen, onClose, order, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Vui lòng chọn số sao đánh giá");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await createFeedback(order._id, {
        rating,
        comment: comment.trim(),
      });

      if (response?.data) {
        // Success callback
        onSuccess?.();
        // Reset form
        setRating(0);
        setComment("");
        // Close popup
        onClose();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setRating(0);
      setComment("");
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Đánh giá đơn hàng
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Shop Info */}
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-1">
              {order?.shop_id?.name || "Tên quán"}
            </h3>
            <p className="text-sm text-gray-500">
              Mã đơn: {order?.order_code || "N/A"}
            </p>
          </div>

          {/* Star Rating */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-medium text-gray-700">
              Bạn đánh giá thế nào về món ăn?
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={loading}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
                >
                  <Star
                    size={40}
                    className={`${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm font-medium text-orange-500">
                {rating === 1 && "Rất tệ"}
                {rating === 2 && "Tệ"}
                {rating === 3 && "Bình thường"}
                {rating === 4 && "Tốt"}
                {rating === 5 && "Xuất sắc"}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhận xét của bạn (tùy chọn)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về món ăn, dịch vụ..."
              rows={4}
              disabled={loading}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {comment.length}/500
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || rating === 0}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang gửi...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send size={16} />
                  Gửi đánh giá
                </span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}