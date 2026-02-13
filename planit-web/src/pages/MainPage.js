import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate } from 'react-router-dom';

const PRESET_COLORS = [
  '#4A90E2', '#FF6B6B', '#51CF66', '#FCC419', '#FF922B', '#845EF7', '#339AF0'
];

const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function MainPage() {
  const [schedules, setSchedules] = useState([]);
  const [allHabits, setAllHabits] = useState([]);
  const [dailyHabits, setDailyHabits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [newPlan, setNewPlan] = useState({ title: '', description: '', startTime: '', color: '#4A90E2' });
  const [viewMode, setViewMode] = useState('calendar');
  const [newHabitTitle, setNewHabitTitle] = useState('');

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('planit_user'));

  useEffect(() => {
    if (user) {
      fetchSchedules();
      fetchAllHabits();
    }
  }, [viewMode]);

  const fetchSchedules = () => {
    axios.get(`http://localhost:8080/schedules/user/${user.id}`)
      .then(res => setSchedules(res.data))
      .catch(err => console.error(err));
  };

  const fetchAllHabits = () => {
    axios.get(`http://localhost:8080/habits/user/${user.id}/all`)
      .then(res => setAllHabits(res.data))
      .catch(err => console.warn(err));
  };

  const fetchDailyHabits = (date) => {
    axios.get(`http://localhost:8080/habits/user/${user.id}/${date}`)
      .then(res => setDailyHabits(res.data))
      .catch(err => console.error(err));
  };

  const handleLogout = () => {
    localStorage.removeItem('planit_user');
    window.location.reload();
  };

  const handleDateClick = (info) => {
    if (!user) { alert("로그인 후 이용 가능합니다."); navigate('/login'); return; }
    setSelectedDate(info.dateStr);
    if (viewMode === 'calendar') {
      setNewPlan({ ...newPlan, startTime: info.dateStr + "T09:00" });
    } else {
      fetchDailyHabits(info.dateStr);
    }
    setIsModalOpen(true);
  };

  const handleSavePlan = () => {
    if (!newPlan.title) { alert("제목을 입력해주세요!"); return; }
    axios.post(`http://localhost:8080/schedules/${user.id}`, { ...newPlan, endTime: newPlan.startTime })
      .then(() => {
        setNewPlan({ title: '', description: '', startTime: '', color: '#4A90E2' });
        fetchSchedules();
        setIsModalOpen(false);
      });
  };

  // 💡 수정됨: 파라미터로 title을 받아서 '자주 쓰는 습관' 버튼과 입력창 모두에서 사용 가능하게 함
  const addHabit = (presetTitle = '') => {
    const titleToSave = presetTitle || newHabitTitle;
    if (!titleToSave) return;

    axios.post(`http://localhost:8080/habits/${user.id}`, { title: titleToSave, date: selectedDate, done: false })
      .then(() => {
        if (!presetTitle) setNewHabitTitle('');
        fetchDailyHabits(selectedDate);
        fetchAllHabits();
      });
  };

  const toggleHabit = (id) => {
    if (!id) return;
    setDailyHabits(prev => prev.map(h => h.id === id ? { ...h, done: !h.done } : h));
    axios.put(`http://localhost:8080/habits/${id}/toggle`)
      .then(() => fetchAllHabits())
      .catch(() => { fetchDailyHabits(selectedDate); alert("실패했습니다."); });
  };

  const deleteHabit = (id) => {
    if (window.confirm("삭제하시겠습니까?")) {
      axios.delete(`http://localhost:8080/habits/${id}`).then(() => {
        fetchDailyHabits(selectedDate);
        fetchAllHabits();
      });
    }
  };

  const handleEventClick = (info) => {
    if (viewMode === 'habit') {
      const dateStr = formatDate(info.event.start);
      setSelectedDate(dateStr);
      fetchDailyHabits(dateStr);
      setIsModalOpen(true);
    } else {
      setSelectedEvent({
        id: info.event.id, title: info.event.title,
        description: info.event.extendedProps.description, color: info.event.backgroundColor
      });
      setIsDetailModalOpen(true);
    }
  };

  const handleDeleteSchedule = () => {
    if (window.confirm("일정을 삭제하시겠습니까?")) {
      axios.delete(`http://localhost:8080/schedules/${selectedEvent.id}`).then(() => {
        setIsDetailModalOpen(false);
        fetchSchedules();
      });
    }
  };

  // 🚀 핵심 추가 1: 드래그 앤 드롭으로 이벤트 날짜 변경
  const handleEventDrop = (info) => {
    const droppedId = info.event.id;

    if (viewMode === 'calendar') {
      // 일정 이동 시
      let newStartStr = info.event.startStr;
      if (!newStartStr.includes('T')) newStartStr += 'T09:00'; // 시간 없는 경우 기본 시간 셋팅

      axios.put(`http://localhost:8080/schedules/${droppedId}/time`, null, { params: { startTime: newStartStr } })
        .then(() => fetchSchedules())
        .catch(() => {
          alert("일정 이동에 실패했습니다.");
          info.revert(); // 실패 시 제자리로 복구
        });
    } else {
      // 습관 이동 시
      const newDateStr = formatDate(info.event.start);
      axios.put(`http://localhost:8080/habits/${droppedId}/date`, null, { params: { date: newDateStr } })
        .then(() => fetchAllHabits())
        .catch(() => {
          alert("습관 이동에 실패했습니다.");
          info.revert(); // 실패 시 제자리로 복구
        });
    }
  };

  // 🚀 핵심 추가 2: 기존 데이터에서 '자주 쓰는 습관' 목록 추출 (최대 5개)
  const recentHabits = [...new Set(allHabits.map(h => h.title))].filter(t => t).slice(0, 5);

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      <header style={headerStyle}>
        <h1 style={{ color: '#4A90E2', margin: 0 }}>PlanIt</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {user && (
            <button onClick={() => setViewMode(viewMode === 'calendar' ? 'habit' : 'calendar')} style={viewMode === 'calendar' ? habitModeBtnStyle : calendarModeBtnStyle}>
              {viewMode === 'calendar' ? '🌿 전체 습관 모드' : '📅 일정 달력 보기'}
            </button>
          )}
          {user ? (
            <><span><b>{user.name}</b>님 </span><button onClick={handleLogout} style={navButtonStyle}>로그아웃</button></>
          ) : (
            <><button onClick={() => navigate('/login')} style={navButtonStyle}>로그인</button><button onClick={() => navigate('/signup')} style={navButtonStyle}>회원가입</button></>
          )}
        </div>
      </header>

      {user?.birthYear === 2001 && (
        <div style={fortuneStyle}>🐍 <b>2001년생 뱀띠 운세:</b> 오늘은 {viewMode === 'calendar' ? '계획' : '습관'}을 관리하기 아주 좋은 날입니다!</div>
      )}

      <h2 style={{ textAlign: 'center', color: viewMode === 'calendar' ? '#4A90E2' : '#51CF66' }}>
        {viewMode === 'calendar' ? '📅 일정 관리' : '🌿 누적 습관 관리'}
      </h2>

      <div style={calendarWrapperStyle}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="ko"
          selectable={true}
          editable={true} // 💡 드래그 앤 드롭 활성화
          droppable={true}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop} // 💡 드롭했을 때 실행되는 함수 연결
          events={viewMode === 'calendar'
            ? schedules.map(s => ({
                id: s.id, title: s.title, start: s.startTime, color: s.color,
                extendedProps: { description: s.description }
              }))
            : allHabits.map(h => ({
                id: h.id,
                title: (h.done ? '✅ ' : '⬜ ') + h.title,
                start: h.date,
                backgroundColor: h.done ? '#51CF66' : '#f1f3f5',
                borderColor: h.done ? '#51CF66' : '#dee2e6',
                textColor: h.done ? '#fff' : '#495057'
              }))
          }
          eventContent={(eventInfo) => (
            <div style={{
              backgroundColor: eventInfo.event.backgroundColor,
              color: eventInfo.event.textColor || 'white',
              padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem',
              fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis',
              whiteSpace: 'nowrap', width: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              {eventInfo.event.title}
            </div>
          )}
          dayCellDidMount={(info) => {
            if (viewMode === 'habit') {
              const dateStr = formatDate(info.date);
              const daysHabits = allHabits.filter(h => h.date === dateStr);
              if (daysHabits.length > 0 && daysHabits.every(h => h.done)) {
                info.el.style.backgroundColor = '#ebfbee';
                info.el.querySelector('.fc-daygrid-day-number').style.color = '#2b8a3e';
              } else {
                info.el.style.backgroundColor = '';
              }
            } else {
              info.el.style.backgroundColor = '';
            }
          }}
          height="auto"
        />
      </div>

      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginTop: 0 }}>{selectedDate} {viewMode === 'calendar' ? '일정 추가' : '습관 관리'}</h3>

            {viewMode === 'calendar' ? (
              // 일정 모달
              <div>
                <input type="text" placeholder="제목" value={newPlan.title} onChange={(e) => setNewPlan({...newPlan, title: e.target.value})} style={inputStyle} />
                <div style={{ marginBottom: '15px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {PRESET_COLORS.map(color => (
                    <div key={color} onClick={() => setNewPlan({...newPlan, color: color})} style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: color, cursor: 'pointer', border: newPlan.color === color ? '2px solid #333' : '2px solid transparent' }} />
                  ))}
                  <input type="color" value={newPlan.color} onChange={(e) => setNewPlan({...newPlan, color: e.target.value})} style={{ width: '28px', height: '28px', border: 'none', padding: 0, cursor: 'pointer' }} />
                </div>
                <input type="datetime-local" value={newPlan.startTime} onChange={(e) => setNewPlan({...newPlan, startTime: e.target.value})} style={inputStyle} />
                <textarea placeholder="상세 내용" value={newPlan.description} onChange={(e) => setNewPlan({...newPlan, description: e.target.value})} style={{...inputStyle, minHeight: '80px'}} />
                <button onClick={handleSavePlan} style={saveButtonStyle}>일정 저장</button>
              </div>
            ) : (
              // 습관 모달
              <div>
                {/* 🚀 빠른 추가(Preset) 버튼 영역 */}
                {recentHabits.length > 0 && (
                  <div style={{ marginBottom: '15px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#666', display: 'block', marginBottom: '8px' }}>💡 자주 쓰는 습관:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {recentHabits.map(title => (
                        <span key={title} style={presetChipStyle} onClick={() => addHabit(title)}>
                          + {title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                  <input type="text" placeholder="직접 습관 입력..." value={newHabitTitle} onChange={(e) => setNewHabitTitle(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addHabit()} style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                  <button onClick={() => addHabit()} style={habitAddButtonStyle}>추가</button>
                </div>

                <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {dailyHabits.map(habit => (
                    <div key={habit.id} style={habitCardStyle(habit.done)} onClick={() => toggleHabit(habit.id)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={checkBoxStyle(habit.done)}>{habit.done && '✔'}</div>
                        <span style={{ fontSize: '1.1rem', textDecoration: habit.done ? 'line-through' : 'none', color: habit.done ? '#bbb' : '#333' }}>{habit.title}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {habit.done && <span style={{ color: '#51CF66', fontWeight: 'bold', fontSize: '0.9rem' }}>완료!</span>}
                        <button onClick={(e) => { e.stopPropagation(); deleteHabit(habit.id); }} style={{ color: '#ff4d4f', border: 'none', background: 'none', cursor: 'pointer' }}>삭제</button>
                      </div>
                    </div>
                  ))}
                  {dailyHabits.length === 0 && <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>이날은 등록된 습관이 없습니다.</p>}
                </div>
              </div>
            )}
            <button onClick={() => setIsModalOpen(false)} style={{ ...closeButtonStyle, width: '100%', marginTop: '15px' }}>닫기</button>
          </div>
        </div>
      )}

      {/* --- 일정 상세보기 모달 --- */}
      {isDetailModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2 style={{ borderLeft: `6px solid ${selectedEvent.color}`, paddingLeft: '15px' }}>{selectedEvent.title}</h2>
            <p style={{ minHeight: '150px', whiteSpace: 'pre-wrap', color: '#666' }}>{selectedEvent.description}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={handleDeleteSchedule} style={deleteButtonStyle}>삭제</button>
              <button onClick={() => setIsDetailModalOpen(false)} style={closeButtonStyle}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- 스타일 정의 ---
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' };
const navButtonStyle = { padding: '8px 15px', backgroundColor: 'white', border: '1px solid #4A90E2', color: '#4A90E2', borderRadius: '5px', cursor: 'pointer' };
const fortuneStyle = { backgroundColor: '#eef6ff', padding: '15px', borderRadius: '10px', marginBottom: '20px', color: '#0056b3', border: '1px solid #cce5ff' };
const calendarWrapperStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle = { backgroundColor: 'white', padding: '25px', borderRadius: '20px', width: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' };
const inputStyle = { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' };
const saveButtonStyle = { width: '100%', padding: '12px', backgroundColor: '#4A90E2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const deleteButtonStyle = { padding: '10px 20px', backgroundColor: '#fff1f0', color: '#ff4d4f', border: '1px solid #ffccc7', borderRadius: '6px', cursor: 'pointer' };
const closeButtonStyle = { padding: '10px 20px', backgroundColor: '#f5f5f5', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const habitModeBtnStyle = { padding: '8px 16px', backgroundColor: '#51CF66', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' };
const calendarModeBtnStyle = { padding: '8px 16px', backgroundColor: '#4A90E2', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' };
const habitAddButtonStyle = { padding: '10px 15px', backgroundColor: '#51CF66', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const habitCardStyle = (done) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', borderRadius: '10px', border: done ? '2px solid #51CF66' : '1px solid #eee', cursor: 'pointer', backgroundColor: done ? '#f0fff4' : 'white', marginBottom: '8px', transition: 'all 0.2s' });
const checkBoxStyle = (done) => ({ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #ddd', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: done ? '#51CF66' : 'white', color: 'white', fontSize: '12px', borderColor: done ? '#51CF66' : '#ddd' });

// 💡 새로운 스타일 추가: 자주 쓰는 습관 칩
const presetChipStyle = {
  display: 'inline-block',
  padding: '6px 12px',
  backgroundColor: '#f1f3f5',
  color: '#495057',
  borderRadius: '20px',
  fontSize: '0.85rem',
  cursor: 'pointer',
  border: '1px solid #dee2e6',
  transition: 'background-color 0.2s'
};

export default MainPage;