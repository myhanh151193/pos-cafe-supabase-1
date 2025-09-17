import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Không tìm thấy trang</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Trang bạn yêu cầu không tồn tại hoặc đã được di chuyển.
          </p>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/">Về trang chính</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin">Đi đến trang quản trị</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
