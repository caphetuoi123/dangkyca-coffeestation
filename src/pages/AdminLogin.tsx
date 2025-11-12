import { useState, useEffect } from "react";
import { Coffee, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAdminSettings, useMigrateToCloud } from "@/hooks/useCloudSync";

const DEFAULT_PASSWORD = "admin123";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const { settings, loading: settingsLoading } = useAdminSettings();
  const { isMigrating } = useMigrateToCloud();

  const handleLogin = () => {
    const savedPassword = settings.admin_password || DEFAULT_PASSWORD;
    
    if (password === savedPassword) {
      sessionStorage.setItem("adminAuth", "true");
      toast.success("Đăng nhập thành công!");
      navigate("/admin");
    } else {
      toast.error("Mật khẩu không chính xác");
      setPassword("");
    }
  };

  if (isMigrating || settingsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">
            {isMigrating ? "Đang đồng bộ dữ liệu..." : "Đang tải..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary to-accent">
            <Coffee className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">Đăng nhập quản lý</h1>
          <p className="text-muted-foreground">
            Nhập mật khẩu để truy cập trang quản lý
          </p>
        </div>

        {/* Login Form */}
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Mật khẩu
            </label>
            <Input
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
          <Button onClick={handleLogin} className="w-full">
            Đăng nhập
          </Button>
        </Card>

        <Button variant="ghost" onClick={() => navigate("/")} className="w-full gap-2">
          <ArrowLeft className="w-4 h-4" />
          Về trang chủ
        </Button>
      </div>
    </div>
  );
};

export default AdminLogin;
