import React from "react";
import { useSelector } from "react-redux";
import useTranslation from "./../i18";

const TableStats = () => {
  const { t } = useTranslation();

  const tables = useSelector((state) => state.data.tables);
  let freeTables = tables?.filter((table) => table.libre == true)?.length;
  let busyTables = tables?.filter((table) => table.libre == false)?.length;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "left",
        marginLeft: "2rem",
        position: "absolute",
        top: "4rem",
        right: "2rem",
      }}
    >
      <div
        style={{
          marginRight: "2rem",
          width: "150px",
          height: "50px",
          backgroundColor: "blue",
          borderRadius: "5px",
          padding: "10px",
          textAlign: "center",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h4 style={{ color: "white" }}>{freeTables}</h4>
        <h5 style={{ color: "white" }}>{t("freeTable")}</h5>
      </div>
      <div
        style={{
          marginRight: "2rem",
          width: "200px",
          height: "50px",
          backgroundColor: "red",
          borderRadius: "5px",
          padding: "10px",
          textAlign: "center",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h4 style={{ color: "white" }}>{busyTables}</h4>
        <h5 style={{ color: "white" }}>{t("busytables")}</h5>
      </div>
    </div>
  );
};

export default TableStats;
