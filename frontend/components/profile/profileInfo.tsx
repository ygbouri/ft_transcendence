import classes from "../../styles/Profile.module.css";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { EmtyUser, rankObj, UserTypeNew } from "../../Types/dataTypes";
import { useRouter } from "next/router";
import { fetchDATA } from "../../customHooks/useFetchData";
import { getImageBySize, getRankUser } from "../../customHooks/Functions";
import { Toggle } from "@store/UI-Slice";
import { useDispatch } from "react-redux";
import { BsPencilFill } from "react-icons/bs";

const ProfileInfo: React.FC = () => {
  const [user, setUser] = useState<UserTypeNew>(EmtyUser);
  const router = useRouter();
  const dispatch = useDispatch();
  useEffect(() => {
    fetchDATA(setUser, router, "user/info/@me");
    return () => {
      setUser(EmtyUser);
    };
  }, []);
  const toggleHandler = () => dispatch(Toggle());
  const tier: rankObj = getRankUser(user?.stats.GP as number);
  if (user?.login !== "") localStorage.setItem("owner", user?.login);
  const pathImage = getImageBySize(user?.avatar, 220);
  return (
    <div className={`${classes.profile} `}>
      <div className={classes.editBtn}>
        <span>User Profile</span>
        <button onClick={toggleHandler}>
          <BsPencilFill color="white" />
        </button>
      </div>
      <div className={classes.profileInfo}>
        <div className={classes.avatar}>
          <img alt={user?.fullname} src={pathImage} />
        </div>
        <div className={classes.profileSection}>
          <div className={classes.name}>{user?.fullname}</div>
          <div className={classes.login}>
            Login:
            <span className={classes.loginColor}> {user?.login}</span>
          </div>
          <div className={classes.lvl}>Level: {user?.stats.XP} XP</div>
          <div className={classes.gp}>Points: {user?.stats.GP} GP</div>
        </div>
        <div className={classes.tierIcon}>
          <Image src={tier.tier} />
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
