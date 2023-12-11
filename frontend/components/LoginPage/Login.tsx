import { motion } from "framer-motion";
import classes from "../../styles/homePage.module.css";
import { useRouter } from "next/router";
import Image from "next/image";
import { baseUrl } from "../../config/baseURL";
import { useEffect, useState } from "react";
import LoadingElm from "../loading/Loading_elm";
import bg from "../../public/bg-login.jpeg";

const Login = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) return <LoadingElm />;

  return (
    <div className={classes.loginPage}>
      {isMounted && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={classes.loginContainer}
        >
          <div className={classes.loginLeft}>
            <h1>Welcome to our game</h1>
            <div className={classes.loginButtons}>
              <div
                className={classes.login_button}
                onClick={(e) => router.push(`${baseUrl}auth/login`)}
              >
                42 Login
              </div>
            </div>
          </div>
          <div className={classes.loginRight}>
            <Image src={bg} alt="login" className={classes.loginImage} />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Login;
