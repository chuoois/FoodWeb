import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { deleteAccount } from "@/services/auth.service";

export const MyPrivate = () => {
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa tài khoản?\nHành động này không thể hoàn tác!"
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      // await deleteAccount();
      alert("Tài khoản đã được xóa thành công.");
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    } catch (err) {
      alert(err.response?.data?.message || "Xóa tài khoản thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          Thiết lập riêng tư
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý các tùy chọn bảo mật và quyền riêng tư cho tài khoản của bạn.
        </p>
      </div>

      {/* Delete Account Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-base font-medium text-gray-800">
            Yêu cầu xóa tài khoản
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md">
            Sau khi xóa, bạn sẽ không thể đăng nhập hoặc khôi phục dữ liệu. 
            Hãy chắc chắn rằng bạn đã sao lưu thông tin quan trọng.
          </p>
        </div>

        <Button
          onClick={handleDeleteAccount}
          disabled={loading}
          className="bg-red-500 hover:bg-red-600 text-white font-medium flex items-center gap-2 w-fit"
        >
          {loading ? (
            "Đang xử lý..."
          ) : (
            <>
              <AlertTriangle size={16} />
              Xóa tài khoản
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
