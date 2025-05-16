/**
 * src/pages/Login/Login.tsx
 *
 * Renders a button that redirects the user to AWS Cognito Hosted UI for MS365 login.
 */

import React from "react";
import { config } from "../../config";
import Button from "@/components/ui/button";


const Login: React.FC = () => {
  const handleLogin = () => {
    const { cognitoDomain, cognitoClientId } = config;
    const redirectUri = encodeURIComponent(`${window.location.origin}/callback`);
    // Hosted UI URL for Cognito (implicit grant)
    const loginUrl = 
      `https://${cognitoDomain}.auth.us-east-1.amazoncognito.com/login` +
      `?client_id=${cognitoClientId}` +
      `&response_type=token` +
      `&scope=openid+profile` +
      `&redirect_uri=${redirectUri}`;

    window.location.href = loginUrl;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard Login</h1>
      <Button onClick={handleLogin}>
        Sign in with Microsoft 365
      </Button>
    </div>
  );
};

export default Login;
