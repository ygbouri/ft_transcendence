import { motion } from "framer-motion";
import classes from "../../styles/sideNav.module.css";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import {
  fetchDATA,
  fetchUnreadMessage,
  LogOut,
} from "../../customHooks/useFetchData";
import socket_notif from "config/socketNotif";
import { N_ITEMS } from "@Types/dataTypes";
import { FaUser, FaUserFriends, FaGamepad, FaComments } from "react-icons/fa";
import { MdLiveTv } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";

const ItemsNav: React.FC<N_ITEMS> = (props) => {
  const [newMsg, setNewMsg] = useState(false);
  const [isMounted, setisMounted] = useState(false);
  const rout = useRouter();
  const ref = useRef(null);
  const owner = localStorage.getItem("owner");

  const moveHndler = () => {
    setNewMsg(false);
    if (isMounted) rout.push(props.alt);
  };

  useEffect(() => {
    if (props.alt === "/chat") {
      socket_notif.on("newMsgNotif", (res) => {
        if (!rout.asPath.includes("/chat") && res.data.sender !== owner)
          setNewMsg(true);
      });
      if (!rout.asPath.includes("/chat"))
        fetchUnreadMessage(setNewMsg, rout, "chat/unreadMsgs");
    }
    setisMounted(true);
    return () => {
      socket_notif.off("newMsgNotif");
    };
  }, [rout.asPath]);

  return (
    <>
      {isMounted && (
        <div className={classes.backIcons} onClick={moveHndler}>
          <div className={classes.IconsNav} ref={ref}>
            {props.src}
            {props.alt === "/chat" && newMsg && <div />}
          </div>
        </div>
      )}
    </>
  );
};

const SideNav: React.FC<{
  currentPos: string;
}> = (props) => {
  const [isMounted, setisMounted] = useState(false);
  const ref_nav = useRef(null);
  const router = useRouter();
  const NamePage = "/" + router.pathname.split("/")[1];

  const handlerLogOut = () => LogOut(router);

  useEffect(() => {
    setisMounted(true);
  }, []);

  const NAVITEMS: N_ITEMS[] = [
    {
      alt: "/profile",
      src:
        NamePage !== "/profile" ? (
          <FaUser color="#5a5959" fontSize="1.5em" />
        ) : (
          <FaUser color="#4267B2" fontSize="1.5em" />
        ),
      ref_ctn: ref_nav,
    },
    {
      alt: "/game",
      src:
        NamePage !== "/game" ? (
          <FaGamepad color="#5a5959" fontSize="1.5em" />
        ) : (
          <FaGamepad color="#4267B2" fontSize="1.5em" />
        ),
      ref_ctn: ref_nav,
    },
    {
      alt: "/chat",
      src:
        NamePage !== "/chat" ? (
          <FaComments color="#5a5959" fontSize="1.5em" />
        ) : (
          <FaComments color="#4267B2" fontSize="1.5em" />
        ),
      ref_ctn: ref_nav,
    },
    {
      alt: "/friends",
      src:
        NamePage !== "/friends" ? (
          <FaUserFriends color="#5a5959" fontSize="1.5em" />
        ) : (
          <FaUserFriends color="#4267B2" fontSize="1.5em" />
        ),
      ref_ctn: ref_nav,
    },
  ];
  return (
    <>
      {isMounted && (
        <motion.div ref={ref_nav} className={classes.sideNavCtn}>
          <motion.div className={`${classes.sidenav}`}>
            <div className={`${classes.sideItems}`}>
              {NAVITEMS.map((item) => (
                <ItemsNav
                  key={item.alt}
                  alt={item.alt}
                  src={item.src}
                  ref_ctn={item.ref_ctn}
                />
              ))}
            </div>
            <div className={classes.sideItems}>
              <div
                className={`${classes.backIcons} ${classes.logOut}`}
                onClick={handlerLogOut}
              >
                {NamePage === "/logout" ? (
                  <FiLogOut color="#5a5959" fontSize="1.5em" />
                ) : (
                  <FiLogOut color="#5a5959" fontSize="1.5em" />
                )}
              </div>
            </div>
          </motion.div>
          <div className={classes.sidenavInd} />
        </motion.div>
      )}
    </>
  );
};

export default SideNav;
