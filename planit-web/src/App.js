import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [schedules, setSchedules] = useState([]);
  // 입력 필드를 위한 상태 관리
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    color: '#4A90E2',
    isCompleted: false
  });

  const userId = 1; // 테스트용 유저 ID

  useEffect(() => {
    fetchSchedules();
  }, []);

  // 목록 새로고침 함수
  const fetchSchedules = () => {
    axios.get(`http://localhost:8080/schedules/user/${userId}`)
      .then(response => setSchedules(response.data))
      .catch(err => console.error(err));
  };

  // 저장 버튼 클릭 시 실행
  const handleSave = () => {
    axios.post(`http://localhost:8080/schedules/${userId}`, newPlan)
      .then(() => {
        alert("일정이 저장되었습니다!");
        setNewPlan({ title: '', description: '', color: '#4A90E2', isCompleted: false }); // 입력창 초기화
        fetchSchedules(); // 목록 갱신
      })
      .catch(err => console.error("저장 실패:", err));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#4A90E2' }}>PlanIt</h1>

      {/* 입력 폼 섹션 */}
      <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>새 일정 만들기</h3>
        <input
          type="text"
          placeholder="제목"
          value={newPlan.title}
          onChange={(e) => setNewPlan({...newPlan, title: e.target.value})}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        <textarea
          placeholder="설명"
          value={newPlan.description}
          onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        <button onClick={handleSave} style={{ width: '100%', padding: '10px', backgroundColor: '#4A90E2', color: 'white', border: 'none', cursor: 'pointer' }}>
          저장하기
        </button>
      </div>

      {/* 일정 목록 섹션 */}
      <h2>오늘의 일정</h2>
      {schedules.map(item => (
        <div key={item.id} style={{ padding: '10px', borderBottom: '1px solid #eee', borderLeft: `5px solid ${item.color || '#ccc'}` }}>
          <strong>{item.title}</strong>
          <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#666' }}>{item.description}</p>
        </div>
      ))}
    </div>
  );
}

export default App;