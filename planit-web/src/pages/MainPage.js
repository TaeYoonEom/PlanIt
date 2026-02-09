import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate } from 'react-router-dom';

const PRESET_COLORS = [
  '#4A90E2', // 파랑
  '#FF6B6B', // 빨강
  '#51CF66', // 초록
  '#FCC419', // 노랑
  '#FF922B', // 주황
  '#845EF7', // 보라
  '#339AF0'  // 하늘
];

function MainPage() {
  const [schedules, setSchedules] = useState([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newPlan, setNewPlan] = useState({ title: '', description: '', startTime: '', color: '#4A90E2' });

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('planit_user'));

  useEffect(() => {
    if (user) {
      fetchSchedules(user.id);
    }
  }, []);

  const fetchSchedules = (userId) => {
    axios.get(`http://localhost:8080/schedules/user/${userId}`)
      .then(res => setSchedules(res.data))
      .catch(err => console.error(err));
  };

  const handleLogout = () => {
    localStorage.removeItem('planit_user');
    window.location.reload();
  };

  const handleDateClick = (info) => {
    if (!user) {
      alert("로그인 후 이용 가능합니다.");
      navigate('/login');
      return;
    }
    setNewPlan({ ...newPlan, startTime: info.dateStr + "T09:00" });
    setIsAddModalOpen(true);
  };

  const handleSave = () => {
    if (!newPlan.title) { alert("제목을 입력해주세요!"); return; }
    axios.post(`http://localhost:8080/schedules/${user.id}`, { ...newPlan, endTime: newPlan.startTime })
      .then(() => {
        setIsAddModalOpen(false);
        setNewPlan({ title: '', description: '', startTime: '', color: '#4A90E2' });
        fetchSchedules(user.id);
      });
  };

  const handleEventClick = (info) => {
    setSelectedEvent({
      id: info.event.id, title: info.event.title,
      description: info.event.extendedProps.description, color: info.event.backgroundColor
    });
    setIsDetailModalOpen(true);
  };

  const handleDelete = () => {
    if (window.confirm("삭제하시겠습니까?")) {
      axios.delete(`http://localhost:8080/schedules/${selectedEvent.id}`)
        .then(() => {
          setIsDetailModalOpen(false);
          fetchSchedules(user.id);
        });
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      <header style={headerStyle}>
        <h1 style={{ color: '#4A90E2', margin: 0 }}>PlanIt</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {user ? (
            <>
              <span><b>{user.name}</b>님 </span>
              <button onClick={handleLogout} style={navButtonStyle}>로그아웃</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} style={navButtonStyle}>로그인</button>
              <button onClick={() => navigate('/signup')} style={navButtonStyle}>회원가입</button>
            </>
          )}
        </div>
      </header>

      {user?.birthYear === 2001 && (
        <div style={fortuneStyle}>
          🐍 <b>2001년생 뱀띠 운세:</b> 오늘은 계획한 일을 차근차근 실행하기 좋은 날입니다!
        </div>
      )}

      <div style={calendarWrapperStyle}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="ko"
          selectable={true}
          dateClick={handleDateClick}
          events={schedules.map(s => ({
            id: s.id,
            title: s.title,
            start: s.startTime,
            color: s.color, // 서버에서 받아온 색상 값
            extendedProps: { description: s.description }
          }))}
          eventClick={handleEventClick}
          height="auto"
          // 👇 각 일정 제목 칸을 개별적으로 디자인
          eventContent={(eventInfo) => {
            return (
              <div style={{
                backgroundColor: eventInfo.event.backgroundColor, // 각 일정 고유 색상
                color: 'white',               // 글자색
                padding: '2px 6px',           // 안쪽 여백
                borderRadius: '4px',          // 모서리 둥글게
                fontSize: '0.85rem',          // 글자 크기
                fontWeight: '500',            // 글자 두께
                overflow: 'hidden',           // 넘치는 글자 숨김
                textOverflow: 'ellipsis',     // 말줄임표(...) 처리
                whiteSpace: 'nowrap',         // 한 줄로 표시
                width: '100%',                // 가로 꽉 채우기
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)' // 약간의 입체감
              }}>
                {eventInfo.event.title}
              </div>
            );
          }}
        />
      </div>

      {isAddModalOpen && (
              <div style={modalOverlayStyle}>
                <div style={modalContentStyle}>
                  <h3 style={{ marginTop: 0, color: '#333' }}>새 일정 추가</h3>

                  <input type="text" placeholder="제목" value={newPlan.title}
                    onChange={(e) => setNewPlan({...newPlan, title: e.target.value})}
                    style={inputStyle} />

                  {/* 🎨 색상 선택 UI 시작 */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '0.9rem', color: '#666', display: 'block', marginBottom: '8px' }}>테마 색상 설정</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {/* 7가지 기본 팔레트 버튼 */}
                      {PRESET_COLORS.map(color => (
                        <div
                          key={color}
                          onClick={() => setNewPlan({...newPlan, color: color})}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: color,
                            cursor: 'pointer',
                            border: newPlan.color === color ? '2px solid #333' : '2px solid transparent',
                            boxSizing: 'border-box',
                            transition: 'transform 0.1s'
                          }}
                          onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        />
                      ))}

                      {/* 🌈 구분선 및 직접 선택기 */}
                      <div style={{ width: '1px', height: '20px', backgroundColor: '#ddd', margin: '0 5px' }} />

                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                          type="color"
                          value={newPlan.color}
                          onChange={(e) => setNewPlan({...newPlan, color: e.target.value})}
                          style={{
                            cursor: 'pointer',
                            width: '28px',
                            height: '28px',
                            border: 'none',
                            padding: 0,
                            backgroundColor: 'transparent'
                          }}
                        />
                        <span style={{ fontSize: '0.7rem', color: '#888', marginLeft: '4px' }}>직접 선택</span>
                      </div>
                    </div>
                  </div>

                  <input type="datetime-local" value={newPlan.startTime}
                    onChange={(e) => setNewPlan({...newPlan, startTime: e.target.value})}
                    style={inputStyle} />

                  <textarea placeholder="상세 내용" value={newPlan.description}
                    onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                    style={{...inputStyle, minHeight: '100px'}} />

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button onClick={handleSave} style={saveButtonStyle}>저장</button>
                    <button onClick={() => setIsAddModalOpen(false)} style={closeButtonStyle}>취소</button>
                  </div>
                </div>
              </div>
            )}

      {isDetailModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2 style={{ borderLeft: `6px solid ${selectedEvent.color}`, paddingLeft: '15px' }}>{selectedEvent.title}</h2>
            <p style={{ minHeight: '150px', whiteSpace: 'pre-wrap' }}>{selectedEvent.description}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={handleDelete} style={deleteButtonStyle}>삭제</button>
              <button onClick={() => setIsDetailModalOpen(false)} style={closeButtonStyle}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' };
const navButtonStyle = { padding: '8px 15px', backgroundColor: 'white', border: '1px solid #4A90E2', color: '#4A90E2', borderRadius: '5px', cursor: 'pointer' };
const fortuneStyle = { backgroundColor: '#eef6ff', padding: '15px', borderRadius: '10px', marginBottom: '20px', color: '#0056b3', border: '1px solid #cce5ff' };
const calendarWrapperStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '20px', width: '450px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' };
const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' };
const saveButtonStyle = { padding: '10px 25px', backgroundColor: '#4A90E2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const deleteButtonStyle = { padding: '10px 25px', backgroundColor: '#fff1f0', color: '#ff4d4f', border: '1px solid #ffccc7', borderRadius: '6px', cursor: 'pointer' };
const closeButtonStyle = { padding: '10px 25px', backgroundColor: '#f5f5f5', border: 'none', borderRadius: '6px', cursor: 'pointer' };

export default MainPage;