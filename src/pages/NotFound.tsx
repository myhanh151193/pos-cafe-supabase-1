import React from "react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold mb-4">404 — Page Not Found</h1>
        <p className="text-muted-foreground mb-6">Sorry, we couldn't find the page you're looking for.</p>
        <div className="flex justify-center">
          <Button onClick={() => navigate('/')}>Go home</Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
