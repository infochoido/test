import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDocs, collection, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

const textCollectionRef = collection(db, 'tests');

export default function StickyHeadTable() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
            created_at: docData.created_at.toDate(),
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

  const handleChangePage = (newPage) => {
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
      const [year, month, day, time] = formattedDate.split(' ');
      const [hour, minute] = time.split(':');
      return `${year}${month}${day} ${hour}:${minute}`;
    } else {
      return '유효하지 않은 날짜';
    }
  };

  const cellStyle = {
    fontFamily: 'TheJamsil5Bold, sans-serif',
  };

  const paginatedData = initialData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className='mt-5 '>
      <p className='my-3 text-2xl'>커뮤니티</p>
      <table style={{ width: '100%', overflow: 'hidden', maxHeight: '500px', borderSpacing: '0 10px', lineHeight: '1.5' }}>
        <thead className='border-b-3'>
          <tr>
            <th style={{ minWidth: '150px', ...cellStyle }} className='text-lg'>제목</th>
            <th style={{ minWidth: '80px', ...cellStyle }} className='text-lg'>작성자</th>
            <th style={{ minWidth: '120px', ...cellStyle }} className='text-lg'>등록일</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row) => (
            <tr
              key={row.uniqueId}
              onClick={() => handleViewButtonClick(row)}
              style={{ cursor: 'pointer' }}
              className='h-8 border-y-2'
            >
              <td style={{ ...cellStyle }}>{row.title}</td>
              <td style={{ ...cellStyle }}>{row.author}</td>
              <td style={{ ...cellStyle }} className='text-xs'>{formatDateTime(row.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <div>
          <p className="w-20 px-1 m-2 mt-4 font-black text-center bg-white shadow-sm rounded-xl shadow-black md:inline">
            <Link to="/write" style={{ textDecoration: 'none', color: 'inherit' }}>글쓰기</Link>
          </p>
        </div>
        <div className='flex items-center justify-center my-1 space-x-4 text-md'>
          <button onClick={() => handleChangePage(page - 1)} disabled={page === 0}>
            &lt;Prev&gt;
          </button>
          <span>{page + 1}</span>
          <button onClick={() => handleChangePage(page + 1)} disabled={page === Math.ceil(initialData.length / rowsPerPage) - 1}>
            &lt;Next &gt;
          </button>
        </div>
        <div>
          <label className='text-sm '>
            페이지당 글 수:
            <select value={rowsPerPage} onChange={handleChangeRowsPerPage} >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={100}>100</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
  }