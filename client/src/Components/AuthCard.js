import React, { useState } from "react";
import LoginModal from "./LoginModal";
import useTranslation from "./../i18";


const AuthCard = ({ user }) => {
  const { t } = useTranslation();
  const [showLogin, setShowLogin] = useState(false);
  const [clickable, setClickable] = useState(true);

  return (
    <div
      className="auth_card"
      onClick={() => {
        if (clickable == true) {
          setShowLogin(!showLogin);
          setClickable(false);
        }
      }}
    >
      <span>
        <img src="http://141.94.77.9/caisse/icons/waiter.png" width="128px" height="128px" alt="" />
      </span>
      <h6>{user}</h6>
      {showLogin && (
        <LoginModal
          user={user}
          setShowLogin={setShowLogin}
          setClickable={setClickable}
        />
      )}
    </div>
  );
};

export default AuthCard;
