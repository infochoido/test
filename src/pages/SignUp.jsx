import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import InputLabel from "@mui/material/InputLabel";
import Paper from '@mui/material/Paper';
import { signupEmail } from "../firebase";

export const Signup= () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    const handleSignup = async () => {
        if (password !== passwordConfirm) {
          console.log("Passwords do not match");
          return;
        }

        try {
            // Call the signupEmail function from your Firebase setup
            const userCredential = await signupEmail(email, password);
            console.log("User signed up:", userCredential.user);
            alert("회원가입 성공!!")
            navigate("/");
            // You can perform additional actions after successful signup if needed
          } catch (error) {
            console.error("Error signing up:", error.message);
          }
        };

        return (
            <div className="flex items-center justify-center h-[80vh] align-middle">
              <Paper sx={{
                width: 350,
                py: 3,
                px: 2
              }} className="flex flex-col items-center">
                <Typography variant={"h5"} component={"h1"}>회원가입</Typography>
                <Box
                  component={"form"}
                  autoComplete="off"
                  className="flex flex-col"
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
                        placeholder="example@naver.com"
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
                        id="password"
                        type={"password"}
                        size={"small"}
                        fullWidth
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col">
                      <InputLabel>
                        <Typography variant={"overline"} component={"h2"}>
                          비밀번호 확인
                        </Typography>
                      </InputLabel>
                      <TextField
                        id="passwordConfirm"
                        type={"password"}
                        size={"small"}
                        fullWidth
                        placeholder="********"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                      />
                    </div>
                  </Stack>
                  <Button variant="contained" sx={{ mt: 4 }} onClick={handleSignup}>
                    가입하기
                  </Button>
        <div className="flex flex-col items-center w-full">
          <Typography variant={"caption"} sx={{
            mt: 2,
          }}>
            <p>가입 시, 최도현 커뮤니티가 제공하는 서비스를 모두 이용하실 수 있습니다.</p>
            <p>서비스 이용약관, 개인정보처리방침에 동의합니다.</p>
          </Typography>
          <FormControlLabel control={<Checkbox size={"small"} />}
            label={<p className="relative right-2">가입한 이메일로 유용한 소식을 받아볼래요.</p>}
            componentsProps={{
              typography: {variant: "caption"}
            }}
          />
        </div>
      </Box>
      <Divider sx={{width: "100%", mt: 3}}>
        <Typography variant={"caption"}>
          간편 회원가입
        </Typography>
      </Divider>
      <Stack direction={"row"} spacing={2} sx={{mt: 2}}>
        <button onClick={() => console.log("카카오 로그인시도")}>
          <img alt="kakao" src={process.env.PUBLIC_URL + "/kakao-logo.svg"} className="w-[40px] h-[40px]"/>
        </button>
        <button onClick={() => console.log("네이버 로그인시도")}>
          <img alt="naver" src={process.env.PUBLIC_URL + "/naver-logo.svg"} className="w-[40px] h-[40px]"/>
        </button>
      </Stack>
    </Paper>
    </div>
  );
}
