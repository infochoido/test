import * as React from 'react';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link } from 'react-router-dom';

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === 'light'
      ? theme.palette.grey[100]
      : theme.palette.grey[800];
  return {
    backgroundColor,
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    '&:hover, &:focus': {
      backgroundColor: emphasize(backgroundColor, 0.06),
    },
    '&:active': {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12),
    },
  };
}); // TypeScript only: need a type cast here because https://github.com/Microsoft/TypeScript/issues/26591

function handleClick(event) {
  event.preventDefault();
  console.info('You clicked a breadcrumb.');
}

export default function NavigationBar() {
  return (
    <div role="presentation" onClick={handleClick} className="z-0 my-4 mx-7 ">
      <div className="flex items-center space-x-1">
        <Link to={"/"}>
          <p className="text-xl font-black text-black">현우진</p>
        </Link>
        <Link to="/post" className="flex-1">
          <p className="w-full py-2 font-bold text-center bg-slate-300 rounded-xl">커뮤니티</p>
        </Link>
        <Link to="/write">
          <p className="w-12 font-black  md:inline">글쓰기</p>
        </Link>
        <Link to="/write">
          <p className="hidden w-12 font-black md:inline">로그인</p>
        </Link>
        <Link to="/write">
          <p className="hidden w-16 font-black md:inline">회원가입</p>
        </Link>
      </div>
    </div>
  );
}
