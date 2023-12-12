import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';

import { getDocs, collection, orderBy, query } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';

const textCollectionRef = collection(db, 'tests');

export default function StickyHeadTable() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [initialData, setInitialData] = useState([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const q = query(textCollectionRef, orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = [];

      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        const uniqueId = doc.id;
        if (docData.test && docData.created_at) {
          data.push({
            uniqueId: uniqueId,
            password: docData.password,
            title: docData.title,
            author: docData.author,
            test: docData.test,
            created_at: docData.created_at.toDate(),  // Convert Firestore timestamp to JavaScript Date
          });
        }
      });

      setInitialData(data);
    } catch (error) {
      console.error("데이터 가져오기 실패:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleViewButtonClick = (row) => {
    navigate(`/post/${row.uniqueId}`);
  };

  const formatDateTime = (date) => {
    if (date && date.toISOString) {
      const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false };
      const formattedDate = new Intl.DateTimeFormat('ko-KR', options).format(date);
      // 분까지만 표시하고 월, 시간, 분은 ':'로 구분된 형식으로 변경
      const [year, month, day, time] = formattedDate.split(' ');
      const [hour, minute] = time.split(':');
      return `${year}${month}${day} ${hour}:${minute}`;
    } else {
      return '유효하지 않은 날짜';
    }
  };

  const cellStyle = {
    fontFamily: 'TheJamsil5Bold, sans-serif', // 'YourCustomFont'에 원하는 폰트 이름을 추가하세요.
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead style={{ zIndex: 0 }}>
            <TableRow>
              <TableCell style={{ minWidth: 100, ...cellStyle }}>작성 날짜</TableCell>
              <TableCell style={{ minWidth: 170, ...cellStyle }}>제목</TableCell>
              <TableCell style={{ minWidth: 170, ...cellStyle }}>글쓴이</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {initialData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow
                  hover
                  role="checkbox"
                  tabIndex={-1}
                  key={row.uniqueId}
                  onClick={() => handleViewButtonClick(row)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell style={{...cellStyle}}>{formatDateTime(row.created_at)}</TableCell>
                  <TableCell style={{...cellStyle}}>{row.title}</TableCell>
                  <TableCell style={{...cellStyle}}>{row.author}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={initialData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}