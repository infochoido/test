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
import { db } from "../firebase";
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { updateProfile } from "firebase/auth";

export const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState(''); // 이름을 위한 state 추가
  const [nickname, setNickname] = useState(''); // 닉네임을 위한 state 추가
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  const handleCheckboxChange = (event) => {
    setCheckboxChecked(event.target.checked);
  };

  const handleSignup = async () => {
    if (!email || !password || !passwordConfirm || !checkboxChecked || !name || !nickname) {
      setAlertMessage("모든 필드를 입력하고 약관에 동의해주세요.");
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 2300); // 2초 후에 숨김
      return;
    }
  
    if (password !== passwordConfirm) {
      setAlertMessage("비밀번호와 확인이 일치하지 않습니다.");
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 2300); // 2초 후에 숨김
      return;
    }
  
    try {
      const userCredential = await signupEmail(email, password);
      const user = userCredential.user;
  
      // Firebase Authentication의 display name 업데이트
      await updateProfile(user, {
        displayName: nickname, // 사용자의 닉네임을 displayName에 저장
      });
  
      // Firebase Firestore에 추가로 유저 정보 저장
      const userDocRef = await addDoc(collection(db, 'users'), {
        name: name,
        nickname: nickname,
        email: email,
        coins: 1000,
      });
  
      console.log("User signed up:", user);
      alert("회원가입 성공!!");
      navigate("/");
      // 추가로 필요한 작업이 있다면 여기에서 수행
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setAlertMessage("이미 사용 중인 이메일입니다.");
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 2300); // 2초 후에 숨김
      } else {
        console.error("회원가입 오류:", error.message);
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-[100vh] align-middle mt-10 mb-24">
      <Paper sx={{
        width: 280,
        py: 1,
        px: 2
      }} className="flex flex-col items-center">
        <Typography variant={"h8"} component={"h2"} style={{ fontFamily: 'TheJamsil5Bold, sans-serif' }}>회원가입</Typography>
        <Box
          component={"form"}
          autoComplete="off"
          className="flex flex-col"
        >
          <Stack spacing={1}>
            <div className="flex flex-col">
              <InputLabel>
                <Typography variant={"overline"} component={"h3"} style={{ fontFamily: 'TheJamsil5Bold, sans-serif' }}>
                  닉네임
                </Typography>
              </InputLabel>
              <TextField
                size={"small"}
                fullWidth
                placeholder="이훈식"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <InputLabel>
                <Typography variant={"overline"} component={"h3"} style={{ fontFamily: 'TheJamsil5Bold, sans-serif' }}>
                  이름
                </Typography>
              </InputLabel>
              <TextField
                size={"small"}
                fullWidth
                placeholder="최도현"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <InputLabel>
                <Typography variant={"overline"} component={"h3"} style={{ fontFamily: 'TheJamsil5Bold, sans-serif' }}>
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
                <Typography variant={"overline"} component={"h3"} style={{ fontFamily: 'TheJamsil5Bold, sans-serif' }}>
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
                <Typography variant={"overline"} component={"h3"} style={{ fontFamily: 'TheJamsil5Bold, sans-serif' }}>
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
          <Button variant="contained" sx={{ mt: 4 }} onClick={handleSignup} style={{ fontFamily: 'TheJamsil5Bold, sans-serif' }}>
            가입하기
          </Button>
          <div className="flex flex-col items-center w-full">
            <Typography variant="caption" sx={{ mt: 2, fontSize: '12px' }}>
              <p style={{ fontFamily: 'TheJamsil5Bold, sans-serif', fontWeight: '300', fontSize: '11px' }}>가입 시, 최도현 커뮤니티가 제공하는 서비스를 모두 이용하실 수 있습니다.</p>
              <p style={{ fontFamily: 'TheJamsil5Bold, sans-serif', fontWeight: '300', fontSize: '11px' }}>서비스 이용약관, 개인정보처리방침에 동의합니다.</p>
            </Typography>
            <FormControlLabel control={<Checkbox checked={checkboxChecked} onChange={handleCheckboxChange} size={"small"} />}
              label={<p className="relative right-2" style={{ fontFamily: 'TheJamsil5Bold, sans-serif', fontSize: '11px' }}>가입한 이메일로 유용한 소식을 받아볼래요.</p>}
              componentsProps={{
                typography: { variant: 'caption' }
              }}
            />
          </div>
        </Box>
        <Divider sx={{ width: "100%", mt: 3 }}>
          <Typography variant={"caption"} style={{ fontFamily: 'TheJamsil5Bold, sans-serif' }}>
            간편 회원가입
          </Typography>
        </Divider>
        <Stack direction={"row"} spacing={2} sx={{ mt: 2 }}>
          <button onClick={() => console.log("카카오 로그인시도")}>
            <img alt="kakao" src={process.env.PUBLIC_URL + "/kakao-logo.svg"} className="w-[40px] h-[40px]" />
          </button>
          <button onClick={() => console.log("네이버 로그인시도")}>
            <img alt="naver" src={process.env.PUBLIC_URL + "/naver-logo.svg"} className="w-[40px] h-[40px]" />
          </button>
        </Stack>
        {showAlert && (
          <div className="absolute top-0 mx-auto mt-4">
            <Paper elevation={3} sx={{ p: 1, backgroundColor: "red", color: "white" }}>
              {alertMessage}
            </Paper>
          </div>
        )}
      </Paper>
    </div>
  );
}
