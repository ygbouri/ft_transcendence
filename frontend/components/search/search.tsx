import React, { useState } from "react";
import classes from "../../styles/Search.module.css";
import SearchUserList from "./SearchUser";
import SearchChannelsList from "./SearchChannels";

const SearchComponent: React.FC<{ value: string }> = (props) => {
  const [indexCtn, setIndexCtn] = useState(0);

  const showOverView = () => {
    setIndexCtn(0);
  };

  const hideOverView = () => {
    setIndexCtn(1);
  };

  return (
    <div className={classes.SearchCTN}>
      <div className={classes.navView}>
        <div
          className={`${classes.TitleOverView} ${
            indexCtn === 0 ? classes.btnSelected : ""
          }`}
          onClick={showOverView}
        >
          Users
        </div>
        <div
          className={`${classes.TitleOverView} ${
            indexCtn === 1 ? classes.btnSelected : ""
          }`}
          onClick={hideOverView}
        >
          Channels
        </div>
      </div>
      <div className={classes.ctnIndic}></div>
      {indexCtn === 0 ? (
        <SearchUserList {...props} />
      ) : (
        <SearchChannelsList {...props} />
      )}
    </div>
  );
};

export default SearchComponent;
