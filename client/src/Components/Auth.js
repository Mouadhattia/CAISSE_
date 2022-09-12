import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import AuthCard from "./AuthCard";
import useTranslation from "./../i18";

const Auth = () => {
  const { t } = useTranslation();
  let users = localStorage.getItem("staff")?.split(",") || [];
  const navigate = useNavigate();
  useEffect(() => {
    if (users[0] == undefined) {
      navigate("/init");
    }
  }, []);
  return (
    <div className="auth_window">
      <div style={{ display: "flex" }}>
        {users.map((user) => (
          <AuthCard user={user} />
        ))}
      </div>
    </div>
  );
};

export default Auth;
