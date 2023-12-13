import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { loginEmail } from "../firebase"; // Import the login function from your Firebase setup

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const handleLogin = async () => {
    try {
      // Call the loginEmail function from your Firebase setup
      await loginEmail(email, password);
      console.log("User logged in successfully!");
      alert("로그인 성공!")
      // You can perform additional actions after successful login if needed

      // Redirect to the home page
      navigate("/");
    } catch (error) {
      console.error("Error logging in:", error.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-[80vh] align-middle">
      <Paper
        sx={{
          width: 350,
          py: 3,
          px: 2,
        }}
        className="flex flex-col items-center"
      >
        <Typography variant={"h5"} component={"h1"}>
          로그인
        </Typography>
        <Box
          component={"form"}
          autoComplete="off"
          className="flex flex-col w-full"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin(); // Call the handleLogin function on form submission
          }}
        >
          <Stack spacing={1}>
            <div className="flex flex-col">
              <InputLabel>
                <Typography variant={"overline"} component={"h2"}>
                  이메일
                </Typography>
              </InputLabel>
              <TextField
                size={"small"}
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <InputLabel>
                <Typography variant={"overline"} component={"h2"}>
                  비밀번호
                </Typography>
              </InputLabel>
              <TextField
                type={"password"}
                size={"small"}
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </Stack>
          <Button variant="contained" sx={{ mt: 4 }} type={"submit"}>
            로그인
          </Button>
        </Box>
        <Divider sx={{ width: "100%", mt: 3 }}>
          <Typography variant={"caption"}>간편 로그인</Typography>
        </Divider>
        <Stack direction={"row"} spacing={2} sx={{ mt: 2 }}>
          <button onClick={() => console.log("kakao로그인")}>
            <img
              alt="kakao"
              src={process.env.PUBLIC_URL + "/kakao-logo.svg"}
              className="w-[40px] h-[40px]"
            />
          </button>
          <button onClick={() => console.log("네이버로그인")}>
            <img
              alt="naver"
              src={process.env.PUBLIC_URL + "/naver-logo.svg"}
              className="w-[40px] h-[40px]"
            />
          </button>
        </Stack>
      </Paper>
    </div>
  );
};

export default LoginForm;
