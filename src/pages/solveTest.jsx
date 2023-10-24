import React, {useState, useEffect} from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';

import { getDocs, collection, query } from 'firebase/firestore';
import Modal from 'react-modal';
import { initializeApp } from 'firebase/app';
import { firestore } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDsay0eJbHv-cfJU-J5thQfoHmClrxnJmM",
  authDomain: "test-875d8.firebaseapp.com",
  projectId: "test-875d8",
  storageBucket: "test-875d8.appspot.com",
  messagingSenderId: "230819283164",
  appId: "1:230819283164:web:e2ef3e93945fc3c0593419"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);


Modal.setAppElement('#root'); // 모달이 어디에 렌더링될지 설정

export function CustomModal({ isOpen, onRequestClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="문제 모달"
    >
      <h2>문제 모달</h2>
      {/* 모달 내용을 추가하세요 */}
      <button onClick={onRequestClose}>닫기</button>
    </Modal>
  );
}

const textCollectionRef = collection(db, 'tests');

const columns= [
  { id: 'number', label: '문제번호', minWidth: 100 },
  { id: 'title', label: '제목', minWidth: 170 },
  { id: 'author', label: '문제만든이', minWidth: 170 },
  { id: 'viewButton', label: '문제보기', minWidth: 170 },
];


function createData(number, title, author, test, answer) {
  return { number, title, author, test, answer};
}

export default function StickyHeadTable() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 추가
  const [selectedData, setSelectedData] = useState(null);
  const [initialData, setInitialData] = useState([]);
  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(textCollectionRef);
      const data = [];
  
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        // Assuming you have the "test" field inside each document
        if (docData.test) {
          data.push({
            number: docData.number,    // Replace with the actual field names
            title: docData.title,      // Replace with the actual field names
            author: docData.author,
            test: docData.test,
            answer: docData.answer,    // Replace with the actual field names
          });
        }
      });
  
      return data;
    } catch (error) {
      console.error("데이터 가져오기 실패:", error);
    }
  };
  
  

  useEffect(() => {
    fetchData().then((data) => {
      if (data.length > 0) {
        setInitialData(data);
      }
    });
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };



  const [answer, setAnswer] = useState("");
  const ariaLabel = { 'aria-label': 'description' };
  const checkAnswer = () => {
    if (answer === selectedData.answer) {
      alert("정답입니다");
    } else {
      alert("틀렸습니다");
    }
  };

  const seeAnswer = () =>{
    alert(`${selectedData.answer}`)
  }


  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead  style={{ zIndex: 0 }}>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {initialData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.id === 'viewButton' ? (
                            <button onClick={() => { handleOpenModal(); setSelectedData(row); console.log(initialData) }}>문제보기</button>
                          ) : (
                            column.format && typeof value === 'number' ? column.format(value) : value
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
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
        {selectedData && (
        <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        contentLabel="문제 모달"
        style={{
          overlay: {
            zIndex: 999
          },
          content: {
            zIndex: 999
          }
        }}
      >
        <div className='flex flex-col mt-5 space-y-6'>
          <h2>문제 보기</h2>
          <p className='text-md font-bold'>문제번호: {selectedData.number}</p>
          <p className='text-md font-bold'>제목: {selectedData.title}</p>
          <p className='text-md font-bold'>문제만든이: {selectedData.author}</p>
          <p className='text-md font-bold'>문제: {selectedData.test}</p>
          <Input
            placeholder="정답"
            inputProps={ariaLabel}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <Button variant="outlined" onClick={checkAnswer}>정답입력</Button>
          <Button variant="outlined" onClick={seeAnswer}>정답보기</Button>
          <Button variant="contained" onClick={handleCloseModal}>닫기</Button>
        </div>
      </Modal>
      )}
    </Paper>
  );
}
