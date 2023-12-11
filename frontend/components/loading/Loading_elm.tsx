import { useEffect, useState } from "react";
import classes from "../../styles/Loading.module.css";

const LoadingElm = () => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) return <></>;
  return (
    <div className={classes.dark}>
      <p className={classes.parag}>LOADING...</p>
    </div>
  );
};

export default LoadingElm;
