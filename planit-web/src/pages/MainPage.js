import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate } from 'react-router-dom';

const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function MainPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('planit_user'));

  const [allHabits, setAllHabits] = useState([]);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [todoCategories, setTodoCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (user) {
      fetchAllHabits();
      fetchCategoriesWithItems(selectedDate);
    }
  }, [selectedDate]);

  const fetchAllHabits = () => {
    axios.get(`http://localhost:8080/habits/user/${user.id}/all`)
      .then(res => setAllHabits(res.data))
      .catch(err => console.warn(err));
  };

  const fetchCategoriesWithItems = (date) => {
    if (!date) return;
    axios.get(`http://localhost:8080/todo/categories/user/${user.id}`, { params: { date } })
      .then(res => setTodoCategories(res.data))
      .catch(err => console.error("데이터 로드 실패:", err));
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    axios.post(`http://localhost:8080/todo/categories/${user.id}`, { name: newCategoryName })
      .then(() => {
        setNewCategoryName('');
        fetchCategoriesWithItems(selectedDate);
      });
  };

  const addTodoItem = (categoryId, title) => {
    if (!title.trim()) return;
    axios.post(`http://localhost:8080/todo/categories/${categoryId}/items`, {
      title: title,
      date: selectedDate,
      done: false,
      userId: user.id
    }).then(() => {
      fetchCategoriesWithItems(selectedDate);
      fetchAllHabits();
    });
  };

  const toggleTodo = (itemId) => {
    axios.put(`http://localhost:8080/todo/items/${itemId}/toggle`)
      .then(() => {
        fetchCategoriesWithItems(selectedDate);
        fetchAllHabits();
      });
  };

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm("이 카테고리와 모든 할 일이 삭제됩니다. 계속하시겠습니까?")) {
      axios.delete(`http://localhost:8080/todo/categories/${categoryId}`)
        .then(() => fetchCategoriesWithItems(selectedDate));
    }
  };

  const handleDeleteItem = (itemId) => {
    axios.delete(`http://localhost:8080/todo/items/${itemId}`)
      .then(() => fetchCategoriesWithItems(selectedDate));
  };

  const handleLogout = () => {
    localStorage.removeItem('planit_user');
    window.location.reload();
  };

  return (
    <div style={containerStyle}>
      {/* --- 왼쪽 섹션 (프로필 & 달력) --- */}
      <div style={leftSectionStyle}>
        <div style={profileCardStyle}>
          <div style={avatarStyle}>태윤</div>
          <h2 style={{ fontSize: '1.8rem', margin: '15px 0' }}>{user?.name}</h2>
          <p style={{ fontSize: '1rem', color: '#888' }}>2001년생 뱀띠 개발자 🐍</p>
          <button onClick={handleLogout} style={logoutBtnStyle}>로그아웃</button>
        </div>

        <div style={calendarWrapperStyle}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale="ko"
            height="auto"
            dateClick={(info) => setSelectedDate(info.dateStr)}
            dayCellDidMount={(info) => {
              const dateStr = formatDate(info.date);
              const dayItems = allHabits.filter(d => d.date === dateStr);
              if (dayItems.length > 0 && dayItems.every(item => item.done)) {
                info.el.style.backgroundColor = '#ebfbee';
              }
            }}
          />
        </div>
      </div>

      {/* --- 오른쪽 섹션 (주제별 리스트) --- */}
      <div style={rightSectionStyle}>
        <div style={rightHeaderStyle}>
          <h2 style={{ fontSize: '2.2rem' }}>📅 {selectedDate}</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()} // 💡 카테고리 엔터 등록
              placeholder="카테고리 추가"
              style={mainInputStyle}
            />
            <button onClick={handleAddCategory} style={mainAddBtnStyle}>추가</button>
          </div>
        </div>

        <div style={todoScrollAreaStyle}>
          {todoCategories.map(cat => (
            <div key={cat.id} style={{ position: 'relative' }}>
              <CategoryBox
                category={cat}
                onAdd={addTodoItem}
                onToggle={toggleTodo}
                onDeleteItem={handleDeleteItem}
              />
              <button
                onClick={() => handleDeleteCategory(cat.id)}
                style={categoryDeleteBtnStyle}
                title="카테고리 삭제"
              >
                🗑️
              </button>
            </div>
          ))}
          {todoCategories.length === 0 && (
            <p style={{ textAlign: 'center', color: '#999', marginTop: '100px', fontSize: '1.2rem' }}>
              새로운 카테고리를 추가하여 할 일을 관리해보세요!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// --- 주제별 상세 입력 박스 컴포넌트 ---
function CategoryBox({ category, onAdd, onToggle, onDeleteItem }) {
  const [val, setVal] = useState('');

  // 💡 입력 내용에 따라 높이를 조절하는 함수
    const handleTextareaChange = (e) => {
      const target = e.target;
      setVal(target.value);

      // 높이 초기화 후 스크롤 높이에 맞춰 재설정
      target.style.height = 'auto';
      target.style.height = `${target.scrollHeight}px`;
    };

  const handleKeyDown = (e) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift + Enter는 줄바꿈 허용
      } else {
        e.preventDefault();
        handleAddClick();
      }
    }
  };

  const handleAddClick = () => {
    if (!val.trim()) return;
    onAdd(category.id, val);
    setVal('');
  };

  return (
    <div style={categoryBoxStyle}>
      <h3 style={categoryTitleStyle}>
        📂 {category.name}
      </h3>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
         <textarea
          value={val}
          onChange={handleTextareaChange} // 💡 높이 조절 함수 연결
          onKeyDown={handleKeyDown}
          placeholder="상세 내용을 입력하세요"
          style={{
                      ...textareaBoxStyle,
                      height: '40px', // 💡 기본 높이를 줄임
                      minHeight: '40px',
                      maxHeight: '200px', // 너무 무한정 커지지 않게 제한 (선택사항)
                      overflowY: 'hidden', // 스크롤바 숨김
                      padding: '10px 15px', // 패딩 살짝 조정
                    }}
                    rows={1}
        />
        <button onClick={handleAddClick} style={detailAddBtnStyle}>
          +
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        {category.items && category.items.map(item => (
          <div key={item.id} style={todoItemRowStyle}>
            <div
              style={{ display: 'flex', alignItems: 'center', flex: 1, cursor: 'pointer' }}
              onClick={() => onToggle(item.id)}
            >
              <div style={checkBoxStyle(item.done)}>{item.done && '✔'}</div>
              <span style={{
                fontSize: '1.2rem',
                textDecoration: item.done ? 'line-through' : 'none',
                color: item.done ? '#ccc' : '#333',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}>
                {item.title}
              </span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id); }}
              style={itemDeleteBtnStyle}
              title="삭제"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 스타일 정의 ---
const containerStyle = { display: 'flex', maxWidth: '1300px', margin: '0 auto', padding: '50px 20px', minHeight: '100vh', gap: '50px' };
const leftSectionStyle = { width: '400px' };
const rightSectionStyle = { flex: 1 };
const profileCardStyle = { textAlign: 'center', marginBottom: '40px', padding: '30px', borderRadius: '20px', backgroundColor: '#f8f9fa' };
const avatarStyle = { width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#dee2e6', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 'bold' };
const logoutBtnStyle = { marginTop: '10px', padding: '8px 20px', border: '1px solid #ddd', background: '#fff', borderRadius: '20px', cursor: 'pointer' };
const calendarWrapperStyle = { width: '100%' };
const rightHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '3px solid #eee', paddingBottom: '20px' };
const mainInputStyle = { padding: '15px', borderRadius: '10px', border: '2px solid #ddd', fontSize: '1.1rem', width: '300px' };
const mainAddBtnStyle = { padding: '15px 25px', backgroundColor: '#4A90E2', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' };
const categoryBoxStyle = { backgroundColor: '#fff', border: '2px solid #eef2f7', padding: '25px', borderRadius: '15px', marginBottom: '25px' };
const todoItemRowStyle = { display: 'flex', alignItems: 'center', padding: '12px 15px', marginBottom: '8px', backgroundColor: '#fafafa', borderRadius: '10px' };
const checkBoxStyle = (done) => ({ width: '25px', height: '25px', borderRadius: '5px', border: '2px solid #ddd', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: done ? '#51CF66' : 'white', color: 'white', marginRight: '15px' });
const todoScrollAreaStyle = { overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' };

const categoryDeleteBtnStyle = { position: 'absolute', top: '25px', right: '25px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.5 };
const itemDeleteBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', marginLeft: '10px', color: '#ff6b6b' };

// --- CategoryBox 전용 스타일 ---
const categoryTitleStyle = { fontSize: '1.5rem', color: '#4A90E2', margin: '0 0 15px 0', paddingRight: '40px', fontWeight: 'bold' };
const textareaBoxStyle = { flex: 1, padding: '12px 15px', fontSize: '1.1rem', border: '2px solid #ced4da', borderRadius: '10px', outline: 'none', resize: 'none', backgroundColor: '#fff', lineHeight: '1.5', fontFamily: 'inherit' };
const detailAddBtnStyle = { width: '55px', backgroundColor: '#51CF66', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' };

export default MainPage;