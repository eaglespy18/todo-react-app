const [dark, setDark] = useState(false);

useEffect(() => {
  document.body.className = dark ? 'dark' : 'light';
}, [dark]);

<button onClick={() => setDark(!dark)}>
  {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
</button>
