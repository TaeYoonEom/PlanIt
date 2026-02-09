import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    axios.post('http://localhost:8080/auth/login', { email, password })
      .then(res => {
        // 로그인 성공 시 유저 정보를 로컬 스토리지에 저장
        localStorage.setItem('planit_user', JSON.stringify(res.data));
        navigate('/'); // 메인 화면으로 이동
      })
      .catch(err => {
        alert("로그인 실패: 이메일 또는 비밀번호를 확인하세요.");
      });
  };

  return (
    <div style={authContainerStyle}>
      <div style={authBoxStyle}>
        <h2 style={{ color: '#4A90E2' }}>PlanIt 로그인</h2>
        <div style={{ marginBottom: '20px' }}>
          <input type="email" placeholder="이메일" value={email}
            onChange={e => setEmail(e.target.value)} style={authInputStyle} />
          <input type="password" placeholder="비밀번호" value={password}
            onChange={e => setPassword(e.target.value)} style={authInputStyle} />
        </div>
        <button onClick={handleLogin} style={authButtonStyle}>로그인</button>
        <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>
          계정이 없으신가요? <span onClick={() => navigate('/signup')} style={{ color: '#4A90E2', cursor: 'pointer', fontWeight: 'bold' }}>회원가입</span>
        </p>
      </div>
    </div>
  );
}

const authContainerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' };
const authBoxStyle = { backgroundColor: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', textAlign: 'center', width: '380px' };
const authInputStyle = { width: '100%', padding: '15px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' };
const authButtonStyle = { width: '100%', padding: '15px', backgroundColor: '#4A90E2', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' };

export default LoginPage;