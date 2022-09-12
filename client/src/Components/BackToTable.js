import React from "react";
import { useNavigate } from "react-router";
import { Button } from "react-bootstrap";
import useTranslation from "./../i18";

const BackToTable = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div>
      <Button onClick={() => navigate("/main")}>{t("backToTable")}</Button>
    </div>
  );
};

export default BackToTable;
