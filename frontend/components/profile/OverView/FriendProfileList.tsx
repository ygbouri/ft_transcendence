import classes from "../../../styles/FriendList.module.css";
import ListFriends from "./ListFriends";
import PendingList from "./PendingList";
import { useState } from "react";
import BlockList from "./BlockList";
import { motion } from "framer-motion";

const FriendProfileList = () => {
  const [indexCtn, setIndexCtn] = useState(0);
  const [inputValue, setInputValue] = useState("");

  const clearValue = () => {
    setInputValue("");
  };
  const FirendListHandler = () => {
    clearValue();
    setIndexCtn(0);
  };
  const PendingListHandler = () => {
    clearValue();
    setIndexCtn(1);
  };
  const BlockedListHandler = () => {
    clearValue();
    setIndexCtn(2);
  };
  return (
    <div className={classes.FriendCtn}>
      <div className={classes.friends}>
        <div className={classes.friendHeader}>
          <div className={classes.btnCtn}>
            <div
              onClick={FirendListHandler}
              className={`${classes.btnFriend} ${
                indexCtn === 0 ? classes.btnSelected : ""
              }`}
            >
              All Friends
            </div>
            <div
              onClick={PendingListHandler}
              className={`${classes.btnFriend} ${
                indexCtn === 1 ? classes.btnSelected : ""
              }`}
            >
              Pending
            </div>
            <div
              onClick={BlockedListHandler}
              className={`${classes.btnFriend} ${
                indexCtn === 2 ? classes.btnSelected : ""
              }`}
            >
              Blocked Users
            </div>
          </div>
        </div>
        <motion.div
          key={indexCtn ? indexCtn : "empty"}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {(indexCtn === 0 && <ListFriends search={inputValue} />) ||
            (indexCtn === 1 && <PendingList search={inputValue} />) ||
            (indexCtn === 2 && <BlockList search={inputValue} />)}
        </motion.div>
      </div>
    </div>
  );
};

export default FriendProfileList;
