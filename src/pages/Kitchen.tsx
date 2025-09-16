import React from "react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";

const Kitchen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Kitchen Display</h1>
        <p className="text-muted-foreground mb-6">This is the kitchen view for order preparation.</p>
        <div className="flex justify-center">
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    </div>
  );
};

export default Kitchen;
