import classes from "../../../styles/overView.module.css";
import "react-sweet-progress/lib/style.css";
import React, { useEffect, useState } from "react";
import LeaderBoard from "./LeaderBord";

const OverView: React.FC = () => {
  const [isMounted, setisMounted] = useState(true);

  useEffect(() => {
    setisMounted(true);
  }, []);
  return (
    <>
      {isMounted && (
        <div className={classes.overviewCtn}>
          <div className={classes.navView}>
            <div className={classes.TitleOverView}>Leaderbord</div>
          </div>

          <div className={classes.overview}>
            <LeaderBoard />
          </div>
        </div>
      )}
    </>
  );
};

export default OverView;
