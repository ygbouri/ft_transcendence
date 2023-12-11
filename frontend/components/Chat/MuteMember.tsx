import Styles from "@styles/Chat/MuteMember.module.css";
import { Dispatch, SetStateAction, useRef } from "react";
import { motion } from "framer-motion";
import { member } from "@Types/dataTypes";
import { fetchMuteMember } from "@hooks/useFetchData";
import { useOutsideAlerter } from "@hooks/Functions";
import { FaTimes } from 'react-icons/fa';

interface Props {
  setShowMuteMember: Dispatch<SetStateAction<boolean>>;
  setIsSuccess: Dispatch<SetStateAction<boolean>>;
  convId?: string;
  member: member;
}

export const MuteMember: React.FC<Props> = ({
  setShowMuteMember,
  setIsSuccess,
  convId,
  member,
}) => {
  const refOption = useRef(null);

  const closeMuteMember = () => {
    setShowMuteMember(false);
  };

  const formSubmitHandler = async (event: any) => {
    event.preventDefault();
    if (
      await fetchMuteMember(
        {
          member: member.login,
        },
        convId
      )
    ) {
      setIsSuccess(true);
      closeMuteMember();
    }
  };

  const closeOptions = (v: boolean) => {
    setShowMuteMember(v);
  };

  useOutsideAlerter(refOption, closeOptions);

  return (
    <>
      <motion.div
        className={Styles.MuteMemberBackground}
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
      >
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.1,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          ref={refOption}
        >
          <form
            className={Styles.MuteMemberContainer}
            onSubmit={(e) => formSubmitHandler(e)}
          >
            <div className={Styles.MuteMemberHeader}>
              <div> Mute Member</div>
              <FaTimes style={{ cursor: 'pointer', color: "#fff", width: "24px", height: "24px" }} onClick={closeMuteMember} />
            </div>
            <div className={Styles.MuteMemberOptionsContainer}>
              <div className={Styles.MuteMemberOption}>
                Check to mute member
                <input
                  type={"radio"}
                  name="muteMemberOption"
                  id="8 Hours"
                  value="8 Hours"
                ></input>
                <label htmlFor="8 Hours"></label>
              </div>
            </div>
            <input type="submit" value="Mute" />
          </form>
        </motion.div>
      </motion.div>
    </>
  );
};
