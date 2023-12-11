import FriendProfileList from "@components/profile/OverView/FriendProfileList";
import classes from "../../styles/FriendList.module.css";

const Friends = () => {
  return (
    <>
      <div className={classes.friendprofilelist}>
        <div className={classes.title}>Friends</div>
        <FriendProfileList />
      </div>
    </>
  );
};
export default Friends;
