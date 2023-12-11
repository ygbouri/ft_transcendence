import classes from "../../../styles/overView.module.css";
import Image from "next/image";
import { isMobile } from "react-device-detect";
import { useEffect, useState } from "react";
import {
  matchDataType,
  rankObj,
  UserTypeNew,
} from "../../../Types/dataTypes";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { fetchDATA } from "../../../customHooks/useFetchData";
import { getImageBySize, getRankUser } from "../../../customHooks/Functions";

const ElmRank: React.FC<matchDataType> = (props) => {
  let rankStyle: React.CSSProperties = {};
  if (props.badge === 1) {
    rankStyle.border = "2px solid gold";
  }

  const route = useRouter();
  const owner = localStorage.getItem("owner");
  const Clickhandler = () => {
    if (props.relation === "blocked" || props.login === owner) return;
    route.push("/profile/" + props.login);
  };
  const tier: rankObj = getRankUser(props.GP);
  const pathImage = getImageBySize(props.avatar, 70);
  return (
    <div className={classes.tableElments} style={rankStyle}>
      <div className={classes.Rank}>
        <div className={classes.SvgSize}>
          {props.badge}
        </div>
      </div>
      <div
        className={`${classes.User} ${classes.UserTR}`}
        onClick={Clickhandler}
      >
        <div className={classes.profileUser}>
          <img src={pathImage} />
        </div>
        {props.login}
      </div>
      <div className={`${classes.games} ${classes.gamesTotal}`}>
        {props.games}
      </div>
      <div className={`${classes.games} ${classes.gamesTotal}`}>
        {props.Win}
      </div>
      <div className={`${classes.games} ${classes.gamesTotal}`}>
        {props.games - props.Win}
      </div>
      <div className={classes.Tier}>
        <div className={classes.SvgSize}>
          <Image src={tier.tier} />
        </div>
      </div>
    </div>
  );
};

const LeaderBoard: React.FC = () => {
  const [listUsers, setListUsers] = useState<UserTypeNew[]>([]);
  const [isUp, SetIsUp] = useState(false);
  const router = useRouter();
  useEffect(() => {
    fetchDATA(setListUsers, router, "user/leaderborad");
    SetIsUp(true);
    return () => {
      setListUsers([]);
    };
  }, []);

  return (
    <>
      {isUp && (
        <div className={classes.leaderBoard}>
          <div className={classes.table}>
            <div className={classes.LeaderBordTitle} />
            <div className={classes.leaderBoardctn}>
              <div
                className={`${
                  isMobile ? classes.tableTitlesInMobile : classes.tableTitles
                }`}
              >
                <div className={`${classes.Rank} ${classes.tableTitle}`}>
                  Rank
                </div>
                <div className={`${classes.User} ${classes.tableTitle}`}>
                  Users
                </div>
                <div className={`${classes.games} ${classes.tableTitle}`}>
                  Games
                </div>
                <div className={`${classes.games} ${classes.tableTitle}`}>
                  Wines
                </div>
                <div className={`${classes.games} ${classes.tableTitle}`}>
                  Losses
                </div>
                <div className={`${classes.Tier} ${classes.tableTitle}`}>
                  Title
                </div>
              </div>
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className={classes.leaderBoardTable}
              >
                {listUsers &&
                  listUsers.map((user, idx) => (
                    <ElmRank
                      key={user?.login}
                      fullName={user?.fullname}
                      games={user?.numGames}
                      Win={user?.gamesWon}
                      badge={idx + 1}
                      avatar={user?.avatar}
                      login={user?.login}
                      GP={user?.GP}
                      relation={user?.relation}
                    />
                  ))}
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeaderBoard;
