import { Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary to-accent">
            <Coffee className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Quản lý lịch làm việc
          </h1>
          <p className="text-lg text-muted-foreground">
            Hệ thống quản lý đa cửa hàng
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate("/register")}>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Coffee className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Đăng ký ca làm việc</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Dành cho nhân viên đăng ký các ca làm việc trong tuần
                </p>
              </div>
              <Button className="w-full" onClick={() => navigate("/register")}>
                Đăng ký ca
              </Button>
            </div>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate("/admin")}>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Coffee className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Quản lý hệ thống</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Dành cho quản lý - xếp lịch, quản lý nhân viên và cửa hàng
                </p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => navigate("/admin")}>
                Truy cập quản lý
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
