import classes from "../../../styles/Profile.module.css";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import {
  ADDButton,
  FriendButton,
  PendingButton,
  RequestButton,
} from "../../../components/buttons";
import {
  getImageBySize,
  getRankUser,
  useOutsideAlerter,
} from "../../../customHooks/Functions";
import { EmtyUser, rankObj, UserTypeNew } from "../../../Types/dataTypes";
import { fetchDATA } from "../../../customHooks/useFetchData";
import LoadingElm from "../../loading/Loading_elm";

const OptionOfFriend: React.FC<{
  relation: string;
  login: string;
  refresh: () => void;
}> = (props) => {
  const router = useRouter();

  const [optionTaggle, setoptionTaggle] = useState(false);
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, setoptionTaggle);
  return (
    <div className={classes.optionBtnFriend}>
      <span>User Profile</span>
      <div className={classes.options}>
        {props.relation === "none" && (
          <ADDButton
            login={props.login}
            router={router}
            refresh={props.refresh}
          />
        )}
        {props.relation === "friend" && (
          <FriendButton
            login={props.login}
            router={router}
            refresh={props.refresh}
          />
        )}
        {props.relation === "requested" && (
          <RequestButton
            login={props.login}
            router={router}
            refresh={props.refresh}
          />
        )}
        {props.relation === "pending" && (
          <PendingButton
            login={props.login}
            router={router}
            refresh={props.refresh}
          />
        )}
      </div>
    </div>
  );
};

const ProfileFriendInfo: React.FC<{ id: string | undefined }> = (props) => {
  const [userInfo, setUserInfo] = useState<UserTypeNew>(EmtyUser);
  const [isMounted, setIsMounted] = useState(false);
  const route = useRouter();
  const refresh = async () =>
    await fetchDATA(setUserInfo, route, `user/info/${props.id}`);
  useEffect(() => {
    fetchDATA(setUserInfo, route, `user/info/${props.id}`);
    setIsMounted(true);
    return () => {
      setUserInfo(EmtyUser);
    };
  }, [props.id]);
  if (isMounted && userInfo.relation === "blocked") {
    route.back();
    return <LoadingElm />;
  }
  if (userInfo?.fullname === "") return <LoadingElm />;
  const lvl = Math.floor(
    userInfo?.stats.XP === 0 ? 0 : userInfo?.stats.XP / 1000
  );
  const lvlP = (userInfo?.stats.XP % 1000) / 10;
  const tier: rankObj = getRankUser(userInfo?.stats.GP);
  const pathImage = getImageBySize(userInfo?.avatar, 220);

  const getStatusColor = (status: string) => {
    return status === "Offline" ? "#FF2400" : "#00A36C";
  };
  const statusColor = getStatusColor(userInfo?.status);
  return (
    <>
      {isMounted && (
        <div className={`${classes.profile} `}>
          <OptionOfFriend
            relation={userInfo.relation}
            login={userInfo.login}
            refresh={refresh}
          />
          <div className={classes.profileInfo}>
            <div className={classes.avatarContainer}>
              <div className={classes.avatar}>
                {userInfo && <img src={pathImage} />}
              </div>
              {userInfo.relation === "friend" && (
                <div
                  className={classes.statusCircle}
                  style={{ backgroundColor: statusColor }}
                />
              )}
            </div>
            <div className={classes.profileSection}>
              <div className={classes.nameAndStatus}>
                <div className={classes.nameFriend}>{userInfo?.fullname}</div>
              </div>
              <div className={classes.login}>Login:
                <span className={classes.loginColor}> {userInfo?.login}</span>
              </div>
              <div className={classes.lvl}>Level: {userInfo?.stats.XP} XP</div>
              <div className={classes.gp}>Points: {userInfo?.stats.GP} GP</div>
            </div>
            <div className={classes.tierIcon}>
              <Image
                style={{ backgroundColor: "transparent" }}
                src={tier.tier}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileFriendInfo;
