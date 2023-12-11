import classes from "../../styles/MatchHistory.module.css";
import { useEffect, useState } from "react";
import { HistoryMatchType } from "../../Types/dataTypes";
import { useRouter } from "next/router";
import { fetchDATA } from "../../customHooks/useFetchData";
import { getImageBySize } from "../../customHooks/Functions";

export const Match: React.FC<HistoryMatchType> = (props) => {
  const router = useRouter();
  const owner = localStorage.getItem("owner");
  const profileHandler = () => {
    if (props.login === owner) return;
    router.push(`/profile/${props.login}`);
  };
  const pathImage = getImageBySize(props.avatar, 70);
  let rankStyle: React.CSSProperties = {};
  if (props.yourScore > props.opponentScore) {
    rankStyle.border = "2px solid #15fe00";
  } else {
    rankStyle.border = "2px solid #ff6482";
  }
  return (
    <div className={classes.match} style={rankStyle}>
      <div className={classes.Avatar_name} onClick={profileHandler}>
        <div className={classes.avatar}>
          <img src={pathImage} />
        </div>
        <div className={classes.dataMatch}>{props.login}</div>
      </div>
      <div className={`${classes.dataMatch}`}>
        {props.yourScore + " - " + props.opponentScore}
      </div>
      <div
        className={`${
          props.yourScore > props.opponentScore ? classes.won : classes.loss
        }`}
      >
        {props.yourScore > props.opponentScore ? "You Won" : "You Lost"}
      </div>
    </div>
  );
};

const MatchHistory: React.FC = () => {
  const [data, setData] = useState<HistoryMatchType[] | null>([]);
  const rout = useRouter();

  useEffect(() => {
    fetchDATA(setData, rout, `game/matchHistory`);
    return () => {
      setData(null);
    };
  }, []);
  return (
    <div className={classes.history}>
      <div className={classes.titleMatchHistory}>Match History</div>
      <div className={classes.historyMatchCtn}>
        {(data?.length &&
          data?.map((match) => <Match key={Math.random()} {...match} />)) || (
          <div />
        )}
      </div>
    </div>
  );
};

export default MatchHistory;
