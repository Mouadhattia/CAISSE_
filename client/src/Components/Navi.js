import React from "react";

import useTranslation from "./../i18";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faFingerprint } from "@fortawesome/free-solid-svg-icons";

const Navi = ({ title }) => {
  const { t } = useTranslation();

  return (
    <div className="my_navbar">
      <h4 className="logo">
         
        {t(`${title}`)}
      </h4>
    </div>
  );
};

export default Navi;
