import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', birthYear: '' });
  const navigate = useNavigate();

  const handleSignup = () => {
    if (!form.name || !form.email || !form.password || !form.birthYear) {
      alert("모든 정보를 입력해주세요.");
      return;
    }
    axios.post('http://localhost:8080/auth/signup', form)
      .then(() => {
        alert("회원가입 성공! 로그인해주세요.");
        navigate('/login');
      })
      .catch(err => {
        alert("회원가입 실패: " + err.message);
      });
  };

  return (
    <div style={authContainerStyle}>
      <div style={authBoxStyle}>
        <h2 style={{ color: '#4A90E2' }}>PlanIt 회원가입</h2>
        <div style={{ marginBottom: '20px' }}>
          <input type="text" placeholder="이름" value={form.name}
            onChange={e => setForm({...form, name: e.target.value})} style={authInputStyle} />
          <input type="email" placeholder="이메일" value={form.email}
            onChange={e => setForm({...form, email: e.target.value})} style={authInputStyle} />
          <input type="password" placeholder="비밀번호" value={form.password}
            onChange={e => setForm({...form, password: e.target.value})} style={authInputStyle} />
          <input type="number" placeholder="출생연도 (예: 2001)" value={form.birthYear}
            onChange={e => setForm({...form, birthYear: e.target.value})} style={authInputStyle} />
        </div>
        <button onClick={handleSignup} style={authButtonStyle}>가입하기</button>
        <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>
          이미 계정이 있나요? <span onClick={() => navigate('/login')} style={{ color: '#4A90E2', cursor: 'pointer', fontWeight: 'bold' }}>로그인</span>
        </p>
      </div>
    </div>
  );
}

// 스타일은 LoginPage와 동일하므로 재사용
const authContainerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' };
const authBoxStyle = { backgroundColor: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', textAlign: 'center', width: '380px' };
const authInputStyle = { width: '100%', padding: '15px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' };
const authButtonStyle = { width: '100%', padding: '15px', backgroundColor: '#4A90E2', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' };

export default SignupPage;