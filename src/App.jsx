function App() {
  const [msg, setMsg] = useState('Проверка...');

  useEffect(() => {
    fetch('https://studyplan-2oec.onrender.com/api/test')
      .then(res => res.json())
      .then(data => setMsg(data.status))
      .catch(() => setMsg('Ошибка соединения!'));
  }, []);

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>{msg}</h1>
    </div>
  );
}
export default App;
